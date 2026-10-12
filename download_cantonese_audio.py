"""Download verified Jyutping reference-chart example syllables, unchanged speed."""
import json,subprocess,concurrent.futures,urllib.request
from pathlib import Path
root=Path('dist/cantonese');data=json.loads((root/'data.json').read_text());clips={x['sample'] for x in data['items']+data['tones']+data['checked'] if x['audio']}
for p in data['pairs']:clips.update([p[2],p[4]])
clips.add('gwong1')
(root/'audio').mkdir(exist_ok=True)
base='https://raw.githubusercontent.com/CanCLID/jyutping.org/master/public/audio/'
def fetch(clip):
 path=root/'audio'/(clip+'.mp3');url=base+clip+'.mp3'
 for attempt in range(3):
  try:
   b=path.read_bytes() if path.exists() else urllib.request.urlopen(url,timeout=25).read();path.write_bytes(b)
   subprocess.run(['ffmpeg','-v','error','-i',str(path),'-f','null','-'],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
   duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(path)]))
   return dict(file=path.name,sample=clip,url=url,status='decoded',bytes=len(b),duration=duration,listening_review=False,kind='reference-example-syllable',source='jyutping.org / CanCLID; reference attributes audio to words.hk')
  except Exception:
   if path.exists():path.unlink()
   if attempt==2:raise
with concurrent.futures.ThreadPoolExecutor(6) as pool:report=list(pool.map(fetch,sorted(clips)))
(root/'audio-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');(root/'assets.js').write_text('const CANTONESE_ASSETS = '+json.dumps({x['file']:x for x in report},ensure_ascii=False)+';\n')
print('Fully decoded',len(report),'clips')

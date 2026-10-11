import concurrent.futures,json,pathlib,urllib.request,urllib.parse,subprocess
P=pathlib.Path(__file__).parent/'dist';d=json.loads((P/'content.json').read_text()); jobs=[]
for x in d['sounds']:
 s=x['uk'].replace('ɡ','g'); jobs.append(('ipa-'+x['id']+'.mp3','https://raw.githubusercontent.com/xiaozhah/phoneme_audio/main/audio/'+urllib.parse.quote(s+'_isolation.mp3')))
words=set(x['word'] for x in d['sounds']+d['extra'])|set(x[0] for x in d['diffs'])|set(w for x in d['pairs'] for w in x[:2])
for w in words:
 for a in ['gb','us']:jobs.append((w+'-'+a+'.mp3',f'https://ssl.gstatic.com/dictionary/static/sounds/20200429/{w}--_{a}_1.mp3'))
def get(job):
 name,url=job; p=P/'audio'/name
 prior={}
 try: prior=next((r for r in json.loads((P/'assets-report.json').read_text()) if r['file']==name),{})
 except Exception: pass
 if p.exists():
  v=subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1',str(p)],capture_output=True,text=True)
  if not v.returncode and v.stdout.strip():return dict(file=name,url=prior.get('url',url),status='decoded',duration=float(v.stdout),bytes=p.stat().st_size,listening_review=False)
 try:
  req=urllib.request.Request(url)
  with urllib.request.urlopen(req,timeout=20) as r:b=r.read()
  p.write_bytes(b)
  v=subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1',str(p)],capture_output=True,text=True)
  if v.returncode or not v.stdout.strip():p.unlink();raise ValueError('decode failed')
  return dict(file=name,url=url,status='decoded',duration=float(v.stdout),bytes=len(b),listening_review=False)
 except Exception as e:
  return dict(file=name,url=url,status='unavailable',error=str(e),listening_review=False)
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:results=list(pool.map(get,jobs))
(P/'assets-report.json').write_text(json.dumps(results,ensure_ascii=False,indent=2));(P/'assets.js').write_text('const ASSETS = '+json.dumps({r['file']:r for r in results},ensure_ascii=False)+';')
print('Decoded',sum(r['status']=='decoded' for r in results),'/',len(results));print('Missing', [r['file'] for r in results if r['status']!='decoded'])

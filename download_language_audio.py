"""Fetch and fully decode only new-language clips; never touches English audio."""
import concurrent.futures,json,re,subprocess,urllib.request,urllib.parse
from pathlib import Path
from html.parser import HTMLParser
class SourceParser(HTMLParser):
 def __init__(self):super().__init__();self.char=None;self.items={}
 def handle_comment(self,text):
  m=re.search(r'\[\s*([\u3131-\u3163])\s*\]',text)
  if m:self.char=m[1]
 def handle_starttag(self,tag,attrs):
  attrs=dict(attrs)
  if tag=='source' and self.char:
   src=attrs.get('src','')
   if src.endswith('.mp3') or (src.endswith('.ogg') and self.char not in self.items):self.items[self.char]=urllib.parse.urljoin('https://hangul.fun/',src)
def read(url):return urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=25).read()
p=SourceParser();p.feed(read('https://hangul.fun/').decode())
data=json.loads(Path('dist/language-content.json').read_text())
files=[]
for lang,items in data.items():
 for item in items:
  url='https://files.tofugu.com/articles/japanese/2014-06-30-learn-hiragana/'+urllib.parse.quote(item['hira'])+'_v2.mp3' if lang=='japanese' else p.items[item['char']]
  files.append((lang,item,url))
root=Path('dist/language-audio');root.mkdir(exist_ok=True)
def fetch(args):
 lang,item,url=args;path=root/item['audio']
 for attempt in range(3):
  try:
   b=path.read_bytes() if path.exists() else read(url)
   if not path.exists() and url.endswith('.ogg'):
    raw=path.with_suffix('.ogg');raw.write_bytes(b)
    subprocess.run(['ffmpeg','-v','error','-y','-i',str(raw),str(path)],check=True);raw.unlink();b=path.read_bytes()
   else:path.write_bytes(b)
   subprocess.run(['ffmpeg','-v','error','-i',str(path),'-f','null','-'],stdout=subprocess.DEVNULL,stderr=subprocess.PIPE,check=True)
   duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(path)]))
   return dict(file=item['audio'],url=url,lang=lang,label=item.get('hira',item.get('char')),bytes=len(b),duration=duration,status='decoded',source='Tofugu' if lang=='japanese' else 'Hangul.fun',listening_review=False)
  except Exception:
   if path.exists():path.unlink()
   if attempt==2:raise
with concurrent.futures.ThreadPoolExecutor(6) as pool:
 report=list(pool.map(fetch,files))
Path('dist/language-audio-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
Path('dist/language-assets.js').write_text('const LANGUAGE_ASSETS = '+json.dumps({x['file']:x for x in report},ensure_ascii=False)+';\n')
print(f'Downloaded and fully decoded {len(report)} new clips.')

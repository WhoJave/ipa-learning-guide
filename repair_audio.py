import concurrent.futures,json,pathlib,urllib.request,subprocess
P=pathlib.Path('dist'); records=json.loads((P/'assets-report.json').read_text()); jobs=[r for r in records if r['status']!='decoded']
def repair(r):
 candidates=[r['url'].replace('20200429','oxford'),r['url'].replace('_1.mp3','_1.4.mp3'),r['url'].replace('_1.mp3','_1.8.mp3'),r['url'].replace('--_','--1_')]
 for url in candidates:
  try:
   with urllib.request.urlopen(url,timeout=15) as f:b=f.read()
   p=P/'audio'/r['file'];p.write_bytes(b);v=subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1',str(p)],capture_output=True,text=True)
   if v.returncode or not v.stdout.strip():p.unlink();continue
   return dict(file=r['file'],url=url,status='decoded',duration=float(v.stdout),bytes=len(b),listening_review=False)
  except Exception:pass
 return r
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:fixed=list(pool.map(repair,jobs))
lookup={r['file']:r for r in fixed};records=[lookup.get(r['file'],r) for r in records]
(P/'assets-report.json').write_text(json.dumps(records,ensure_ascii=False,indent=2));(P/'assets.js').write_text('const ASSETS = '+json.dumps({r['file']:r for r in records},ensure_ascii=False)+';')
print('Decoded',sum(r['status']=='decoded' for r in records),'/',len(records));print('Missing',[r['file'] for r in records if r['status']!='decoded'])

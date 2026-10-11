"""Bundle American IPA Chart phoneme recordings (never example-word audio).
Run: python3 add_us_audio.py [downloaded-chart.svg]
The three R combinations are explicitly separated component demonstrations.
"""
import base64, json, subprocess, sys, tempfile, urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path
SVG_URL='https://americanipachart.s3.amazonaws.com/american-IPA-chart-english.svg'
svg=Path(sys.argv[1]).read_bytes() if len(sys.argv)>1 else urllib.request.urlopen(SVG_URL).read()
root=ET.fromstring(svg)
clips={}
for node in root.iter():
    key=node.get('id','')
    if key.endswith('_audio_phoneme'):
        sources=[s.get('src','') for s in node if s.tag.split('}')[-1]=='source']
        embedded=next(s for s in sources if s.startswith('data:audio/mpeg;base64,'))
        clips[key.removesuffix('_audio_phoneme')]=(base64.b64decode(embedded.split(',',1)[1]),next(s for s in sources if s.startswith('https:')))
mapping={'i':'vowel_green','ih':'vowel_pink','e':'vowel_red','ae':'vowel_sand','a':'vowel_coffee','lot':'vowel_coffee','aw':'vowel_mauve','uh':'vowel_wood','u':'vowel_blue','strut':'vowel_dust','nurse':'vowel_purple','schwa':'vowel_dust','face':'diphthong_jade','goat':'diphthong_gold','price':'diphthong_lime','choice':'diphthong_turquoise','mouth':'diphthong_brown','p':'consonant_pig','b':'consonant_bear','t':'consonant_turtle','dd':'consonant_dog','k':'consonant_cat','g':'consonant_goat','f':'consonant_frog','vv':'consonant_beaver','th':'consonant_panther','dh':'consonant_feather','s':'consonant_snake','z':'consonant_zebra','sh':'consonant_sheep','zh':'consonant_television','h':'consonant_horse','ch':'consonant_chicken','j':'consonant_giraffe','m':'consonant_mouse','n':'consonant_dinosaur','ng':'consonant_penguin','l':'consonant_lion','r':'consonant_rabbit','y':'consonant_yak','w':'consonant_wolf','rhotic':'vowel_purple'}
report=[x for x in json.loads(Path('dist/assets-report.json').read_text()) if not x['file'].startswith('ipa-us-')]
for ident,key in mapping.items():
    data,url=clips[key]; file=f'ipa-us-{ident}.mp3'; path=Path('dist/audio')/file;path.write_bytes(data)
    report.append(dict(file=file,url=url,status='decoded',bytes=len(data),listening_review=False,kind='isolated-phoneme',source='American IPA Chart',source_symbol_note='The source merges STRUT/schwa and uses one isolated R-colored vowel; stress/weakness must be learned in words.' if ident in ('strut','schwa','nurse','rhotic') else ''))
for ident,first in {'near':'ih','square':'e','cure':'uh'}.items():
    file=f'ipa-us-{ident}.mp3';path=Path('dist/audio')/file
    # Keep a short pause: an educational component sequence, not a natural syllable.
    subprocess.run(['ffmpeg','-v','error','-y','-i',f'dist/audio/ipa-us-{first}.mp3','-i','dist/audio/ipa-us-r.mp3','-filter_complex','[0:a]aresample=44100,aformat=channel_layouts=mono,apad=pad_dur=0.08[a];[1:a]aresample=44100,aformat=channel_layouts=mono[b];[a][b]concat=n=2:v=0:a=1[out]','-map','[out]','-codec:a','libmp3lame',str(path)],check=True)
    report.append(dict(file=file,url=SVG_URL,status='decoded',bytes=path.stat().st_size,listening_review=False,kind='component-sequence',components=[f'ipa-us-{first}.mp3','ipa-us-r.mp3'],source='American IPA Chart; component sequence with 80 ms pause'))
for item in report:
    path=Path('dist/audio')/item['file']
    subprocess.run(['ffmpeg','-v','error','-i',str(path),'-f','null','-'],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
    item['duration']=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',str(path)]))
Path('dist/assets-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
Path('dist/assets.js').write_text('const ASSETS = '+json.dumps({x['file']:x for x in report},ensure_ascii=False)+';\n')
print(f'Validated {len(report)} recordings, including 45 US phoneme/component demonstrations.')

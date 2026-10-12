"""Generate an independent Jyutping guide; source charts verify example/audio mappings."""
import json,re,sys,urllib.request
from pathlib import Path
SOURCE='https://raw.githubusercontent.com/CanCLID/jyutping.org/master/'
def source(name):
 cache=Path(sys.argv[1])/('yue-'+name) if len(sys.argv)>1 else None
 return cache.read_text() if cache and cache.exists() else urllib.request.urlopen(SOURCE+'src/components/jyutping/'+name,timeout=25).read().decode()
final_examples={}
for text,clip in re.findall(r'<td[^>]*>([^<]+)(?:<Audio[^>]*id="([^"]+)"[^>]*/>)?</td>',source('FinalsChart.astro')):
 parts=text.strip().split();final_examples[parts[0]]=(parts[1] if len(parts)>1 else '',clip)
onsets=[('b','p','巴','baa1','双唇闭合后放开，通常不送气；粤拼 b 不是英语浊 b。'),('p','pʰ','怕','paa3','双唇放开时明显送气。'),('m','m','媽','maa1','双唇闭合，气流经过鼻腔。'),('f','f','花','faa1','上齿靠下唇，产生摩擦。'),('d','t','打','daa2','舌尖闭塞后放开，通常不送气。'),('t','tʰ','他','taa1','舌尖放开后明显送气。'),('n','n','那','naa5','舌尖抵齿龈，鼻腔通气；与 l 分别练习。'),('l','l','啦','laa1','舌尖抵齿龈，气流从舌侧通过。'),('g','k','家','gaa1','舌后闭塞放开，通常不送气。'),('k','kʰ','卡','kaa1','舌后放开时明显送气。'),('ng','ŋ','牙','ngaa4','舌后鼻音；可以出现在词首，不要在前面加 e。'),('h','h','蝦','haa1','气流从声门通过，轻擦而出。'),('gw','kʷ','瓜','gwaa1','舌后闭塞同时圆唇，通常不送气。'),('kw','kʷʰ','夸','kwaa1','圆唇的舌后送气音，不是把 k 和 w 分成两个音节。'),('w','w','蛙','waa1','圆唇滑音。'),('z','ts','渣','zaa1','不送气塞擦音；不是普通话卷舌 zh。'),('c','tsʰ','叉','caa1','送气塞擦音；不是英语字母 c 的读法。'),('s','s','沙','saa1','舌前部形成摩擦；不必卷舌。'),('j','j','也','jaa5','接近普通话 y 的滑音，不是普通话 j。'),('∅','—','呀','aa3','零声母不写字母；不要机械在所有元音前补 ng。')]
items=[]
for symbol,ipa,word,clip,note in onsets:
 items.append(dict(id='onset-'+(symbol if symbol!='∅' else 'zero'),symbol=symbol,ipa=ipa,word=word,sample=clip,audio=clip+'.mp3',group='initials',family='声母',note=note,kind='例字整音节'))
finals={'aa':'aa aai aau aam aan aang aap aat aak','a':'a ai au am an ang ap at ak','e':'e ei eu em en eng ep et ek','i':'i iu im in ing ip it ik','o':'o oi ou on ong ot ok','u':'u ui um un ung up ut uk','oe':'oe oeng oet oek','eo':'eoi eon eot','yu':'yu yun yut'}
note={'aa':'aa 与 a 同时有音色和时长差异，aa 不只是把 a 拉长。','a':'a 较短、较中央；与 aa 的字例对照。','e':'e 与 ei 等组合的音色不同；部分 e 系韵母只见于口语或少见词。','i':'i 接 -ng / -k 时音色会变化，按具体韵母学。','o':'o 与 ou 的音色不同，不要按英语字母 o 读。','u':'u 接 -ng / -k 时音色会变化；保持圆唇。','oe':'oe 是前部圆唇元音；与 eo 系韵腹区分。','eo':'eo 是拼写韵腹，常见组合 eoi / eon / eot；不能把 eo 独立当作完整韵母。','yu':'舌位接近 i，双唇圆起，近普通话 ü；不是英语 you。'}
rare={'a','eu','em','en','ep','et','um','up','oet'}
for family,syms in finals.items():
 for symbol in syms.split():
  word,clip=final_examples[symbol];checked=symbol.endswith(('p','t','k'));coda='入声韵尾' if checked else '鼻音韵尾' if symbol.endswith(('m','n','ng')) else '开尾 / 元音韵尾'
  items.append(dict(id='final-'+symbol,symbol=symbol,ipa='',word=word,sample=clip,audio=clip+'.mp3' if clip else None,group='finals',family=family,rare=symbol in rare,checked=checked,coda=coda,kind='例字整音节' if word else '音节示范' if clip else '暂无录音',note=note[family]+(' 韵尾闭住后不爆破；对应入声调通常标 1、3、6。' if checked else '')+(' 此项属于较少见或扩展韵母，不表示所有声母都能自由组合。' if symbol in rare else '')))
for symbol,ipa,word,clip in [('m','m̩','唔','m4'),('ng','ŋ̍','吳','ng4')]:
 items.append(dict(id='nasal-'+symbol,symbol=symbol,ipa=ipa,word=word,sample=clip,audio=clip+'.mp3',group='nasals',family='自成音节鼻音',kind='例字整音节',note='鼻音本身可构成整个音节，不另加元音；这里播放 '+clip+'。与作为声母、韵尾的同形字母区别。'))
tones=[]
for n,name,pitch,word,shape in [(1,'阴平','55','詩',[5,5]),(2,'阴上','35 / 25','史',[3,5]),(3,'阴去','33','試',[3,3]),(4,'阳平','21 / 11','時',[2,1]),(5,'阳上','13 / 23','市',[1,3]),(6,'阳去','22','事',[2,2])]:
 tones.append(dict(number=n,name=name,pitch=pitch,word=word,sample='si'+str(n),audio='si'+str(n)+'.mp3',shape=shape))
pairs=[('送气与不送气','波','bo1','坡','po1','同为第 1 调，留意气流；不是英语 b / p 的清浊区别。'),('舌后送气对照','家','gaa1','卡','kaa1','同为第 1 调，比较舌后闭塞放开后的气流。'),('aa 与 a','山','saan1','新','san1','相同声母和声调，韵腹音色与时长都不同。'),('鼻音韵尾 m / n','心','sam1','身','san1','相同第 1 调；一个闭唇，一个舌尖抵齿龈。'),('鼻音韵尾 n / ng','真','zan1','增','zang1','相同声母和声调；舌尖与舌后闭合位置不同。'),('入声韵尾 t / k','八','baat3','百','baak3','同为第 3 调；舌尖闭住与舌后闭住，不额外爆破。'),('n 与 l','你','nei5','理','lei5','同为第 5 调；n 有鼻腔气流，l 是边音。也用于理解香港口音变体。')]
checked=[dict(word='識',sample='sik1',audio='sik1.mp3',tone=1,traditional=7),dict(word='洩',sample='sit3',audio='sit3.mp3',tone=3,traditional=8),dict(word='蝕',sample='sik6',audio='sik6.mp3',tone=6,traditional=9)]
data=dict(items=items,tones=tones,pairs=pairs,checked=checked)
root=Path('dist/cantonese');root.mkdir(exist_ok=True)
(root/'data.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');(root/'data.js').write_text('const CANTONESE_DATA = '+json.dumps(data,ensure_ascii=False)+';\n')
print('Onsets:',len(onsets),'finals:',sum(len(v.split()) for v in finals.values()),'nasals: 2; tones: 6')

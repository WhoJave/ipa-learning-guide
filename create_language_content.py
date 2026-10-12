"""Build additive Japanese/Korean learning-page data. Never modifies English files."""
import json
from pathlib import Path
base=[('あいうえお','a i u e o','母音'),('かきくけこ','ka ki ku ke ko','K 行'),('さしすせそ','sa shi su se so','S 行'),('たちつてと','ta chi tsu te to','T 行'),('なにぬねの','na ni nu ne no','N 行'),('はひふへほ','ha hi fu he ho','H 行'),('まみむめも','ma mi mu me mo','M 行'),('や ゆ よ','ya - yu - yo','Y 行'),('らりるれろ','ra ri ru re ro','R 行'),('わ   を','wa - - - wo','W 行'),('ん','n','拨音')]
voiced=[('がぎぐげご','ga gi gu ge go','G 行'),('ざじずぜぞ','za ji zu ze zo','Z 行'),('だぢづでど','da ji zu de do','D 行'),('ばびぶべぼ','ba bi bu be bo','B 行'),('ぱぴぷぺぽ','pa pi pu pe po','P 行')]
notes={'し':'舌面靠近硬腭，shi；不是把 si 按英语方式读。','ち':'chi，起始有塞擦，不是 ti。','つ':'tsu，先阻塞再摩擦；不是 su。','ふ':'双唇接近吹气，通常 [ɸɯ]；不是英语咬下唇的 f。','ら':'R 行通常是舌尖轻弹 [ɾ]，不要持续卷舌或颤舌。','り':'R 行通常是舌尖轻弹 [ɾ]。','る':'R 行通常是舌尖轻弹 [ɾ]。','れ':'R 行通常是舌尖轻弹 [ɾ]。','ろ':'R 行通常是舌尖轻弹 [ɾ]。','う':'日语 u 常记 [ɯᵝ]，双唇轻压，圆唇程度不同于普通话「乌」。','を':'现代标准语通常读 o；这里保留 wo 作为拼写区分。作宾格助词使用。','ん':'独占一拍；随后音改变发音位置，不能在所有环境都固定读成 n。','ぢ':'现代标准语通常与 じ 同音，书写依词形与连浊等规则区分；输入法常用 di。','づ':'现代标准语通常与 ず 同音，拼写需要单独记忆；输入法常用 du。'}
ja=[]
for group,rows in [('basic',base),('voiced',voiced)]:
 for chars,romaji,row in rows:
  for col,(hira,roma) in enumerate(zip(chars,romaji.split())):
   if hira==' ':continue
   ident='ja-'+format(ord(hira),'x')
   ja.append(dict(id=ident,hira=hira,kata=chr(ord(hira)+96),roma=roma,row=row,col=col,group=group,note=notes.get(hira,'清晰保持一拍。罗马字用于索引，不等于英语或中文的读法。'),audio=ident+'.mp3'))
for hira,prefix,row in [('き','ky','KY'),('し','sh','SH'),('ち','ch','CH'),('に','ny','NY'),('ひ','hy','HY'),('み','my','MY'),('り','ry','RY'),('ぎ','gy','GY'),('じ','j','J'),('び','by','BY'),('ぴ','py','PY')]:
 for col,(small,vowel) in enumerate(zip('ゃゅょ','auo')):
  text=hira+small;ident='ja-'+ '-'.join(format(ord(c),'x') for c in text)
  ja.append(dict(id=ident,hira=text,kata=''.join(chr(ord(c)+96) for c in text),roma=prefix+vowel,row=row+' 行',col=[0,2,4][col],group='contracted',note='小写 ゃ・ゅ・ょ 和前一个假名合成一拍；'+text+' 不要拆成两个音节。',audio=ident+'.mp3'))
# Standard Unicode Hangul order, useful for syllable composition.
consonants=[('ㄱ','기역','g/k','平音','气流自然，词首与元音间的音值不同；不要固定当英语 g。'),('ㄲ','쌍기역','kk','紧音','喉部较紧、起音集中；不是把 ㄱ 延长两倍。'),('ㄴ','니은','n','鼻音','舌尖抵上齿龈，气流经过鼻腔。'),('ㄷ','디귿','d/t','平音','舌尖阻塞后放开，送气较自然。'),('ㄸ','쌍디귿','tt','紧音','比平音更紧，通常较少送气。'),('ㄹ','리을','r/l','流音','元音间常轻弹舌；收音位置接近 l，不持续卷舌。'),('ㅁ','미음','m','鼻音','闭唇，声音经过鼻腔。'),('ㅂ','비읍','b/p','平音','双唇闭合后放开；与 ㅃ、ㅍ 的送气和紧张度比较。'),('ㅃ','쌍비읍','pp','紧音','双唇较紧，起音集中；不是重读的 ㅂ。'),('ㅅ','시옷','s','摩擦音','舌前部产生摩擦，在 ㅣ 或 y 系元音前常更接近 [ɕ]。'),('ㅆ','쌍시옷','ss','紧音','比 ㅅ 更紧；不要只靠延长来区别。'),('ㅇ','이응','∅ / ng','占位 / 鼻音','声母位置不发音；收音位置读 [ŋ]。名称 이응 不是声母读音。'),('ㅈ','지읒','j','平音','舌面形成塞擦，近 [tɕ]；不是英语 j 的完全复制。'),('ㅉ','쌍지읒','jj','紧音','紧塞擦音，和 ㅈ、ㅊ 对照。'),('ㅊ','치읓','ch','送气音','塞擦后有较强送气。'),('ㅋ','키읔','k','送气音','舌后阻塞放开，明显送气。'),('ㅌ','티읕','t','送气音','舌尖阻塞放开，明显送气。'),('ㅍ','피읖','p','送气音','闭唇放开，明显送气。'),('ㅎ','히읗','h','摩擦音','气流通过声门；与邻音结合时可引发送气化或脱落。')]
vowels=[('ㅏ','a','基本元音','嘴自然张开，舌位较低。'),('ㅐ','ae','组合字形','与 ㅔ 在现代首尔语中常合流；保留拼写区别。'),('ㅑ','ya','基本元音','从短促 y 滑向 ㅏ，合为一个音节。'),('ㅒ','yae','组合字形','y 滑音加 ㅐ，常与 ㅖ 接近。'),('ㅓ','eo','基本元音','不圆唇的后部元音，常记 [ʌ]；eo 不是先 e 再 o。'),('ㅔ','e','组合字形','中前元音；现代口语常与 ㅐ 接近。'),('ㅕ','yeo','基本元音','y 滑音加 ㅓ。'),('ㅖ','ye','组合字形','y 滑音加 ㅔ；部分词中实际读法受位置影响。'),('ㅗ','o','基本元音','后部圆唇元音，和不圆唇的 ㅓ 区分。'),('ㅘ','wa','组合字形','w 滑音加 ㅏ，不拆成两个音节。'),('ㅙ','wae','组合字形','w 滑音加 ㅐ，口语常与 ㅞ、ㅚ 接近。'),('ㅚ','oe','组合字形','传统音值可为 [ø]，现代首尔语常读 [we]；oe 不是英语 oy。'),('ㅛ','yo','基本元音','y 滑音加 ㅗ。'),('ㅜ','u','基本元音','后部圆唇元音。'),('ㅝ','wo','组合字形','w 滑音加 ㅓ；罗马字 wo 不是 w 加英语 o。'),('ㅞ','we','组合字形','w 滑音加 ㅔ。'),('ㅟ','wi','组合字形','现代常读 [wi]；传统可为 [y]。'),('ㅠ','yu','基本元音','y 滑音加 ㅜ。'),('ㅡ','eu','基本元音','舌靠后，嘴不圆，近 [ɯ]；不要读成英语 you。'),('ㅢ','ui','组合字形','词首常保留 [ɰi]；非首音节可读 [i]，作属格助词可读 [e]。'),('ㅣ','i','基本元音','前部高元音，嘴角轻展。')]
ko=[]
for i,(char,name,roma,kind,note) in enumerate(consonants):
 ident='ko-'+format(ord(char),'x');sample=chr(0xAC00+i*21*28)
 ko.append(dict(id=ident,char=char,name=name,roma=roma,kind=kind,group='tense' if kind=='紧音' else 'consonants',index=i,note=note,sample=sample,audio=ident+'.mp3'))
for i,(char,roma,kind,note) in enumerate(vowels):
 ident='ko-'+format(ord(char),'x');sample=chr(0xAC00+11*21*28+i*28)
 ko.append(dict(id=ident,char=char,name=sample,roma=roma,kind=kind,group='vowels' if kind=='基本元音' else 'compound',index=i,note=note,sample=sample,audio=ident+'.mp3'))
data={'japanese':ja,'korean':ko}
Path('dist/language-data.js').write_text('const LANGUAGE_DATA = '+json.dumps(data,ensure_ascii=False)+';\n')
Path('dist/language-content.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print('Japanese:',len(ja),'Korean:',len(ko))

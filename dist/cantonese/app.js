'use strict';
const $=id=>document.getElementById(id),data=CANTONESE_DATA,items=data.items,media=$('audio');
let group='initials',selected=items[0].id,last=null,ticket=0,labSample=null;
const key='sound-atlas-cantonese-mastered';let mastered=new Set();
try{const stored=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(stored))mastered=new Set(stored.filter(id=>items.some(x=>x.id===id)));}catch{}
function status(text){$('playerStatus').textContent=text;}
function stop(){ticket++;media.pause();media.removeAttribute('src');media.load();document.body.classList.remove('playing');}
async function play(sample,word='',kind='例字整音节'){
 stop();const current=ticket;last={sample,word,kind};$('replay').disabled=false;const label=kind+' · '+(word?word+' ':'')+sample;
 if(!sample||CANTONESE_ASSETS[sample+'.mp3']?.status!=='decoded'){status('此项暂无本地录音，请使用资料区的粤拼或粤典核对入口。');return false;}
 media.src='audio/'+sample+'.mp3';status('正在加载：'+label);
 const timeout=setTimeout(()=>{if(current===ticket&&media.readyState<2){stop();status('录音加载超时，请重播或在来源站核对。');}},12000);
 try{await media.play();if(current!==ticket)return false;document.body.classList.add('playing');status('正在播放：'+label);return true;}
 catch{if(current!==ticket)return false;document.body.classList.remove('playing');status('录音暂不可播放，请重播或在来源站核对；没有合成语音替代。');return false;}
 finally{clearTimeout(timeout);}
}
$('stop').addEventListener('click',()=>{stop();status('已停止播放。');});$('replay').addEventListener('click',()=>{if(last)play(last.sample,last.word,last.kind);});
media.addEventListener('ended',()=>{if(!media.hasAttribute('src'))return;document.body.classList.remove('playing');status('播放完毕：'+last.sample+' · 留意目标声韵或声调，再跟读一次。');});
media.addEventListener('error',()=>{if(!media.hasAttribute('src'))return;stop();status('录音加载失败，请重播或在来源站核对。');});
function progress(){const count=items.filter(x=>mastered.has(x.id)).length;$('progressText').textContent=count+' / '+items.length+' 已掌握';$('progressFill').style.width=count/items.length*100+'%';}
function save(){try{localStorage.setItem(key,JSON.stringify([...mastered]));}catch{}progress();}
function visible(){const q=$('search').value.trim().toLowerCase();return items.filter(x=>(group==='all'||x.group===group)&&[x.symbol,x.word,x.sample,x.note,x.coda,x.family].filter(Boolean).some(v=>v.toLowerCase().includes(q)));}
function renderMap(){
 const found=visible();$('soundGrid').replaceChildren();$('empty').hidden=found.length>0;
 for(const family of [...new Set(found.map(x=>x.group==='finals'?x.family:x.family))]){
  const list=found.filter(x=>x.family===family);const heading=document.createElement('div');heading.className='group-heading';heading.innerHTML='<b>'+family+(list[0].group==='finals'?' 系韵母':'')+'</b><small>'+list.length+' 项显示</small>';$('soundGrid').append(heading);const grid=document.createElement('div');grid.className='yue-grid';
  for(const x of list){const button=document.createElement('button');button.type='button';button.className='sound-card yue-card'+(x.id===selected?' active':'')+(!x.audio?' unrecorded':'');button.dataset.id=x.id;button.setAttribute('aria-pressed',String(x.id===selected));button.setAttribute('aria-label',x.audio?'查看 '+x.symbol+'，听'+x.kind+' '+x.word+' '+x.sample:'查看 '+x.symbol+'，暂无录音');button.innerHTML='<span class="card-play" aria-hidden="true">'+(x.audio?'▶':'无录音')+'</span><span class="glyph">'+x.symbol+'</span><span class="alternate" lang="yue">'+(x.word||'—')+'</span><span class="roma">'+(x.sample||'少见扩展')+'</span>'+(x.rare?'<span class="badge">扩展 / 少见</span>':'')+(mastered.has(x.id)?'<span class="mastered-dot" aria-label="已掌握">●</span>':'');button.addEventListener('click',()=>{selected=x.id;renderMap();renderDetail();if(x.audio)play(x.sample,x.word,x.kind);else{stop();last=null;$('replay').disabled=true;status(x.symbol+' 暂无录音；已显示拼写与发音说明。');}});grid.append(button);}$('soundGrid').append(grid);
 }progress();
}
function renderDetail(){
 const x=items.find(x=>x.id===selected);$('soundDetail').innerHTML='<div class="detail-label"><span>SOUND SPOTLIGHT</span><span>YUE</span></div><div class="detail-glyph">'+x.symbol+'</div>'+(x.ipa?'<div class="detail-ipa">参考音值 ['+x.ipa+']</div>':'')+'<h4>发音与拼写</h4><p>'+x.note+'</p><div class="sample-word" lang="yue">'+(x.word||'暂无字例')+'</div><div class="sample-spelling">'+(x.sample||'—')+'</div><button class="primary" id="detailPlay" '+(!x.audio?'disabled':'')+'>▶ '+(x.audio?'听'+x.kind:'暂无录音')+'</button><p>'+(x.audio?'播放 '+x.sample+' 的整个音节'+(x.word?'（'+x.word+'）':'')+'，声调保留；观察其中的目标声母或韵母。':'少见韵母仍属于体系展示；本页不合成、不借用其他录音冒充。')+'</p><button class="mark-button" id="markSound" aria-pressed="'+mastered.has(x.id)+'">'+(mastered.has(x.id)?'✓ 已掌握 · 点击取消':'＋ 标记为已掌握')+'</button><small>本地参考录音 · 保持原速 · 未逐音专家听审</small>';
 $('detailPlay').addEventListener('click',()=>play(x.sample,x.word,x.kind));$('markSound').addEventListener('click',()=>{mastered.has(x.id)?mastered.delete(x.id):mastered.add(x.id);save();renderMap();renderDetail();});
}
$('groupFilters').addEventListener('click',event=>{const button=event.target.closest('[data-group]');if(!button)return;group=button.dataset.group;for(const b of $('groupFilters').children)b.setAttribute('aria-pressed',String(b===button));if(group!=='all'&&items.find(x=>x.id===selected).group!==group)selected=items.find(x=>x.group===group).id;renderMap();renderDetail();});
$('search').addEventListener('input',renderMap);$('resetProgress').addEventListener('click',()=>{mastered.clear();save();renderMap();renderDetail();status('已重置粤语学习记录。');});
for(const t of data.tones){const button=document.createElement('button');button.type='button';button.className='tone-card';button.dataset.tone=t.number;button.setAttribute('aria-label','听第 '+t.number+' 调 '+t.word+' '+t.sample);const y=value=>90-value*15;button.innerHTML='<span class="tone-header"><b>'+t.number+'</b><span>'+t.name+'</span></span><svg viewBox="0 0 160 90" aria-hidden="true">'+[1,2,3,4,5].map(p=>'<line x1="15" x2="145" y1="'+y(p)+'" y2="'+y(p)+'"/>').join('')+'<polyline points="20,'+y(t.shape[0])+' 140,'+y(t.shape[1])+'"/></svg><span class="tone-word"><strong lang="yue">'+t.word+'</strong><span>'+t.sample+' ▶</span></span><small>参考调值 '+t.pitch+' · 点击听字例</small>';button.addEventListener('click',()=>play(t.sample,t.word,'声调字例整音节'));$('toneGrid').append(button);}
for(const x of data.checked){const button=document.createElement('button');button.type='button';button.dataset.checked=x.sample;button.innerHTML='<strong lang="yue">'+x.word+'</strong><span>'+x.sample+' ▶</span><small>传统 '+x.traditional+' → 粤拼 '+x.tone+'</small>';button.addEventListener('click',()=>play(x.sample,x.word,'入声字例整音节'));$('checkedButtons').append(button);}
const rules=[
 ['先锁定一种拼音方案','本页采用 LSHK Jyutping。声调数字紧接音节，组合词按音节分写；耶鲁、刘锡祥等方案使用不同拼写规则。','香港 hoeng1 gong2 ／ 粤语 jyut6 jyu5','不要把其他方案的 y、ü、上标调号直接混进粤拼。'],
 ['不送气与送气，不是英语清浊','b / d / g 对应通常不送气的 [p t k]，p / t / k 送气；gw / kw 同时带圆唇。','波 bo1 / 坡 po1 ／ 家 gaa1 / 卡 kaa1','粤拼 b、d、g 不要求像英语 voiced stop 一样发浊。'],
 ['z、c、s 不套普通话卷舌','z 与 c 是一组不送气／送气塞擦音，s 是摩擦音；具体音色受后续元音及说话人影响。','渣 zaa1 ／ 叉 caa1 ／ 沙 saa1','粤拼没有普通话 zh / ch / sh 那一套拼写。'],
 ['j、yu 与英语读法不同','j 为滑音，近普通话 y；yu 的高前圆唇元音近普通话 ü；舌位靠前而双唇圆起。','也 jaa5 ／ 書 syu1 ／ 雪 syut3','不要把 j 读成普通话 j，也不要把 yu 读成英语 you。'],
 ['aa 与 a：音色、时长一起变','aa 较开、较长，a 较中央、较短；对照相同声母与调号，比较口型和音色。','山 saan1 ／ 新 san1','不是只有长短，不能简单把所有 a 拉长变 aa。'],
 ['oe、eo 与同形母音的变化','oe 是前部圆唇元音；eo 系常见 eoi / eon / eot，eo 不独立作本表完整韵母。i、u 接某些韵尾时音色也变化。','鋸 goe3 ／ 需 seoi1 ／ 詩 si1 / 升 sing1','字母相同不代表各种韵尾前的韵腹音色完全一样。'],
 ['鼻音韵尾 m、n、ng 不能混','m 闭唇，n 用舌尖，ng 用舌后；声音在鼻腔共鸣，不额外补一个元音。','心 sam1 ／ 身 san1 ／ 真 zan1 / 增 zang1','ng 末尾不加一个爆破 g；粤语有 -m 韵尾。'],
 ['入声韵尾 p、t、k：闭住不爆破','-p 用双唇，-t 用舌尖，-k 用舌后；音节在闭塞处收住，通常不把末尾辅音完整爆破。','八 baat3 ／ 百 baak3 ／ 集 zaap6','不要为了“读出最后一个字母”补气或补元音。'],
 ['六个调值与传统九声','粤拼常规调号使用 1–6。传统 7、8、9 分别是配入声韵尾的阴入、中入、阳入，与粤拼 1、3、6 对应。','識 sik1（传统 7）／ 洩 sit3（8）／ 蝕 sik6（9）','九声不是九个互不相同的音高轮廓，入声的韵尾和时长也重要。'],
 ['平调先分高、中、低；升调分起点','先练 1、3、6 的平调对比，再练 2 与 5 的上升。调值是相对音高，不是要求固定音高频率。','詩 si1 ／ 試 si3 ／ 事 si6；史 si2 ／ 市 si5','短促不等于音高；用正常舒适音域练习。'],
 ['零声母、ng 声母、自成音节鼻音','ng 可作声母；零声母不写字母；m、ng 还可以不带普通元音而自成音节。','呀 aa3 ／ 牙 ngaa4 ／ 唔 m4 ／ 吳 ng4','三种结构不同，不要统一在词首加 ng 或给 m、ng 加元音。'],
 ['多音字：词义与搭配决定字音','先学具体字词，再拆声韵调。字形相同不保证每个词里的读音相同，普通话读音也不能唯一推算粤音。','行路 haang4 lou6 ／ 銀行 ngan4 hong4；音樂 jam1 ngok6 / 快樂 faai3 lok6','遇到陌生词用粤典或权威字库核对，避免按单字最常见音硬拼。'],
 ['变调与变音：按词汇和语境学','一些字词有习惯性变调、亲昵或语用变化，实际读法要看词义、构词与说话语境；不要强行只按本调逐字读。','把词典音与自然语流中的整词录音对照','不存在把所有某一调号统一改成另一个调号的通用规则。'],
 ['香港口音的合流：听懂，也选择目标','n / l、部分词首 ng 与零声母等可能因说话人而变化。本表保留传统拼写对立，便于识字和查词。','你 nei5；部分说话人会读作 lei5','入门可先稳定模仿选定说话人；不要把所有音变都称为错误或机械更正。'],
 ['连读有节奏，但字调不会随意消失','字调会在语流中受到邻音、句调和语速影响；词界与语义仍重要。先逐词清楚，再练短句，不逐字平均用力。','录下短句，比较停连与句末语气，再回头核对词汇字调','不要直接移植普通话三声变调或英语连读规则。'],
 ['按声韵调分层练习','先六调和送气对照，再 aa / a、前圆唇元音、鼻音尾、入声尾；每轮只改一个特征，最后放回常用词。','听两遍 → 跟读三遍 → 录音对照 → 学一个词','本页不自动评分，自我标记为已掌握不等于发音已准确。']
];
rules.forEach(([title,body,example,caution],i)=>{const details=document.createElement('details');details.className='rule';details.innerHTML='<summary><span>'+String(i+1).padStart(2,'0')+'</span>'+title+'</summary><p>'+body+'</p><p class="example">'+example+'</p><p class="caution">留意：'+caution+'</p>';$('ruleGrid').append(details);});
for(const [title,a,sa,b,sb,note] of data.pairs){const article=document.createElement('article');article.className='yue-pair';article.innerHTML='<h3>'+title+'</h3><div class="pair-actions"><button type="button"><strong lang="yue">'+a+'</strong><span>'+sa+' ▶</span></button><button type="button"><strong lang="yue">'+b+'</strong><span>'+sb+' ▶</span></button></div><p>'+note+'</p>';const buttons=article.querySelectorAll('button');buttons[0].addEventListener('click',()=>play(sa,a));buttons[1].addEventListener('click',()=>play(sb,b));$('pairGrid').append(article);}
function analyse(){
 const input=$('syllableInput').value.trim().toLowerCase();labSample=null;$('labListen').disabled=true;$('labParts').replaceChildren();
 const match=/^([a-z]+)([1-6])$/.exec(input);if(!match){$('labNote').textContent='请输入一个粤拼音节，末尾使用 ASCII 数字 1–6，例如 gwong1。';return;}
 const base=match[1],tone=Number(match[2]);let initial='',final=base;
 if(!['m','ng'].includes(base)){const choices=items.filter(x=>x.group==='initials'&&x.symbol!=='∅').map(x=>x.symbol).sort((a,b)=>b.length-a.length);initial=choices.find(s=>base.startsWith(s))||'';final=base.slice(initial.length);}
 const known=items.some(x=>(x.group==='finals'||(x.group==='nasals'&&!initial))&&x.symbol===final);if(!known||(!final)){ $('labNote').textContent='无法按本页的声母、韵母表识别此拼写。请核对是否使用粤拼，或是否输入了多个音节。';return;}
 for(const [value,label] of [[initial||'∅','声母'],[final,'韵母'],[String(tone),'字调']]){const span=document.createElement('span'),b=document.createElement('b'),small=document.createElement('small');b.textContent=value;small.textContent=label;span.append(b,small);$('labParts').append(span);}
 const checked=/[ptk]$/.test(final),warning=checked&&![1,3,6].includes(tone);const available=CANTONESE_ASSETS[input+'.mp3']?.status==='decoded';
 $('labNote').textContent=(warning?'塞音收尾的常规入声类别使用 1、3、6；此输入可能涉及变调或拼写问题，需核对具体词。':checked?'这是塞音收尾的入声音节，韵尾通常不爆破。':['m','ng'].includes(base)?'这是自成音节鼻音，声母为空，不额外加普通元音。':'声、韵、调结构已识别。')+' '+(available?'本页有对应音节录音，可直接听示范。':'此组合的实际字词未核实，也未配置录音；不会拼接音频或用 TTS 冒充。');
 if(available){labSample=input;$('labListen').disabled=false;}
}
$('analyse').addEventListener('click',analyse);$('syllableInput').addEventListener('input',analyse);$('syllableInput').addEventListener('keydown',event=>{if(event.key==='Enter')analyse();});$('labListen').addEventListener('click',()=>{if(labSample)play(labSample,'','音节示范');});
for(const sample of ['gwong1','ngaa4','syu1','sik6','m4']){const b=document.createElement('button');b.type='button';b.textContent=sample;b.addEventListener('click',()=>{$('syllableInput').value=sample;analyse();});$('labPresets').append(b);}
$('assetSummary').textContent='本地录音 '+Object.keys(CANTONESE_ASSETS).length+' 项完成下载与完整解码；未逐音专家听审。';renderMap();renderDetail();analyse();

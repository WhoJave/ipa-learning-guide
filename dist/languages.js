'use strict';
const $=id=>document.getElementById(id),language=document.body.dataset.language,isJapanese=language==='japanese',items=LANGUAGE_DATA[language];
let group=isJapanese?'basic':'vowels',script='both',selected=items.find(x=>x.group===(isJapanese?'basic':'vowels')).id,practiceItem=null,last=null,ticket=0;
const storageKey='sound-atlas-'+language+'-mastered';let mastered=new Set();
try{const value=JSON.parse(localStorage.getItem(storageKey)||'[]');if(Array.isArray(value))mastered=new Set(value.filter(id=>items.some(x=>x.id===id)));}catch{}
const media=$('audio');
function status(text){$('playerStatus').textContent=text;}
function stop(){ticket++;media.pause();media.removeAttribute('src');media.load();document.body.classList.remove('playing');}
function audioLabel(item){return isJapanese?'日语假名 · '+item.hira+' / '+item.roma:(['vowels','compound'].includes(item.group)?'韩语元音 · ':item.char==='ㅇ'?'韩语收音示范 · ':'韩语辅音示范 · ')+item.char;}
async function play(item){
 stop();const current=ticket;last=item;$('replay').disabled=false;
 if(LANGUAGE_ASSETS[item.audio]?.status!=='decoded'){status('此录音未配置，请到页面底部的来源站核对。');return false;}
 media.src='../language-audio/'+item.audio;status('正在加载：'+audioLabel(item));
 const timer=setTimeout(()=>{if(current===ticket&&media.readyState<2){stop();status('录音加载超时，请重播或打开来源站核对。');}},12000);
 try{await media.play();if(current!==ticket)return false;document.body.classList.add('playing');status('正在播放：'+audioLabel(item));return true;}
 catch{if(current!==ticket)return false;document.body.classList.remove('playing');status('录音暂不可播放，请检查网络或打开来源站核对；未使用合成语音替代。');return false;}
 finally{clearTimeout(timer);}
}
media.addEventListener('ended',()=>{if(!media.hasAttribute('src'))return;document.body.classList.remove('playing');status('播放完毕：'+audioLabel(last)+' · 试着跟读一次。');});
media.addEventListener('error',()=>{if(!media.hasAttribute('src'))return;stop();status('录音加载失败，请重播或打开来源站核对。');});
$('stop').addEventListener('click',()=>{stop();status('已停止播放。');});$('replay').addEventListener('click',()=>{if(last)play(last);});
function glyph(item){return isJapanese?item[script==='kata'?'kata':'hira']:item.char;}
function visibleItems(){const query=$('search').value.trim().toLowerCase();return items.filter(x=>(group==='all'||x.group===group)&&[x.hira,x.kata,x.roma,x.char,x.name,x.kind,x.row,x.note].filter(Boolean).some(v=>v.toLowerCase().includes(query)));}
function progress(){const count=items.filter(x=>mastered.has(x.id)).length;$('progressText').textContent=count+' / '+items.length+' 已掌握';$('progressFill').style.width=count/items.length*100+'%';}
function card(item){const b=document.createElement('button');b.type='button';b.className='sound-card'+(item.id===selected?' active':'');b.dataset.id=item.id;b.setAttribute('aria-label',audioLabel(item));b.setAttribute('aria-pressed',String(item.id===selected));b.innerHTML='<span class="card-play" aria-hidden="true">▶</span><span class="glyph" lang="'+(isJapanese?'ja':'ko')+'">'+glyph(item)+'</span>'+(isJapanese&&script==='both'?'<span class="alternate" lang="ja">'+item.kata+'</span>':'')+'<span class="roma">'+item.roma+'</span>'+(mastered.has(item.id)?'<span class="mastered-dot" aria-label="已掌握">●</span>':'');if(isJapanese&&item.hira.length>1)b.classList.add('contracted');b.addEventListener('click',()=>{selected=item.id;renderMap();renderDetail();play(item);});return b;}
function renderMap(){
 const found=visibleItems();$('soundGrid').replaceChildren();$('empty').hidden=found.length>0;
 $('mapNote').textContent=isJapanese?'按 a · i · u · e · o 排列。空格表示基础表中没有对应假名；拗音列按 ya · yu · yo 排列。':'罗马字使用入门索引；平音、紧音、送气音要听气流与紧张度。辅音示范不代表它在所有词中都有同一音值。';
 const groups=isJapanese?[['basic','基础五十音 · 46'],['voiced','浊音 / 半浊音 · 25'],['contracted','拗音 · 33']]:[['vowels','基本元音字母 · 10'],['compound','组合元音字母 · 11'],['consonants','基本辅音字母 · 14'],['tense','紧辅音字母 · 5']];
 for(const [key,title] of groups){
  const list=found.filter(x=>x.group===key);if(!list.length)continue;
  const section=document.createElement('div');section.className='table-group';const heading=document.createElement('div');heading.className='group-heading';heading.innerHTML='<b>'+title+'</b><small>'+list.length+' 项显示</small>';section.append(heading);
  if(isJapanese){
   const head=document.createElement('div');head.className='kana-row';head.innerHTML='<span></span>'+['a','i','u','e','o'].map(v=>'<span class="column-head">'+v+'</span>').join('');section.append(head);
   for(const rowName of [...new Set(list.map(x=>x.row))]){const row=document.createElement('div');row.className='kana-row';const label=document.createElement('span');label.className='row-label';label.textContent=rowName;row.append(label);for(let col=0;col<5;col++){const item=list.find(x=>x.row===rowName&&x.col===col);if(item)row.append(card(item));else{const empty=document.createElement('span');empty.className='gap-cell';empty.textContent='—';empty.setAttribute('aria-hidden','true');row.append(empty);}}section.append(row);}
  }else{const grid=document.createElement('div');grid.className='ko-grid';for(const item of list)grid.append(card(item));section.append(grid);}
  $('soundGrid').append(section);
 }progress();
}
function renderDetail(){
 const item=items.find(x=>x.id===selected);$('soundDetail').innerHTML='<div class="detail-label"><span>SOUND SPOTLIGHT</span><span>'+(isJapanese?'JP':'KR')+'</span></div><div class="detail-glyph" lang="'+(isJapanese?'ja':'ko')+'">'+glyph(item)+'</div>'+(isJapanese?'<div class="detail-secondary" lang="ja">'+item[script==='kata'?'hira':'kata']+'</div>':'')+'<div class="detail-roma">'+item.roma+'</div><button class="primary" id="detailPlay">▶ '+(isJapanese?'听假名读音':item.char==='ㅇ'?'听收音 ng 示范':'听字母示范')+'</button><h4>怎么读？</h4><p>'+item.note+'</p>'+(isJapanese?'<h4>平假名 / 片假名</h4><p lang="ja">'+item.hira+' ↔ '+item.kata+'</p>':'<h4>字母名称 · 不是词中读音</h4><p lang="ko">'+item.name+'</p><h4>拼合示例 · 不是当前录音内容</h4><p lang="ko">'+(item.group==='vowels'||item.group==='compound'?'ㅇ ＋ '+item.char:item.char+' ＋ ㅏ')+' → '+item.sample+'</p>')+'<button class="mark-button" id="markSound" aria-pressed="'+mastered.has(item.id)+'">'+(mastered.has(item.id)?'✓ 已掌握 · 点击取消':'＋ 标记为已掌握')+'</button><small>'+(isJapanese?'Tofugu 假名录音 · 平片假名共用对应读音':'Hangul.fun 字母示范 · 声母、收音与语流可能不同')+' · 保持原速</small>';
 $('detailPlay').addEventListener('click',()=>play(item));$('markSound').addEventListener('click',()=>{mastered.has(item.id)?mastered.delete(item.id):mastered.add(item.id);save();renderMap();renderDetail();});
}
function save(){try{localStorage.setItem(storageKey,JSON.stringify([...mastered]));}catch{}progress();}
$('resetProgress').addEventListener('click',()=>{mastered.clear();save();renderMap();renderDetail();status('已重置本语言的学习记录。');});
$('groupFilters').addEventListener('click',event=>{const button=event.target.closest('[data-group]');if(!button)return;group=button.dataset.group;for(const b of $('groupFilters').children)b.setAttribute('aria-pressed',String(b===button));renderMap();nextPractice();});
$('search').addEventListener('input',renderMap);
if(isJapanese)$('scriptToggle').addEventListener('click',event=>{const button=event.target.closest('[data-script]');if(!button)return;script=button.dataset.script;for(const b of $('scriptToggle').children)b.setAttribute('aria-pressed',String(b===button));renderMap();renderDetail();if(practiceItem)$('practiceGlyph').textContent=glyph(practiceItem);});
const japaneseRules=[
 ['一拍，是日语节奏的基础','一个普通假名通常占一拍；ん、促音っ、长音的后半部分也各占一拍。拗音虽然写两个假名，合为一拍。','きゃ：1 拍 ／ きや：2 拍 ／ にっぽん：4 拍','拍（mora）与音节并非同一个概念，不能只数大写假名。'],
 ['长音：多一拍，也会改变意思','元音持续约两拍，不要只提高音量。平假名依词汇常写 あ、い、う、え、お 或组合；片假名通常写长音符号 ー。','おばさん / おばあさん ／ コーヒー','おう 常读长 o，えい 常读长 e，但要结合词和说话方式；不要统一改写原词拼写。'],
 ['促音：小 っ / ッ 不是 tsu','后接塞音时先阻塞一拍；后接摩擦音时延长摩擦。读促音时不要额外发一个完整的 tsu。','きって ／ がっこう ／ カップ','促音不能一概解释为「停顿」，实际动作取决于后续辅音。'],
 ['浊音与半浊音','゛ 通常使 K/S/T/H 行转为 G/Z/D/B 行；゜ 使 H 行成为 P 行。ぢ、づ 的拼写不能只靠听音猜。','か → が ／ は → ば → ぱ','现代标准语 じ / ぢ、ず / づ 通常同音；一些方言仍有区别。'],
 ['拗音：必须注意小字','i 段假名配小 ゃ・ゅ・ょ，读作一拍，不能把两字平均分开读。','しゅ = shu ／ きょう = kyo + 长音一拍','きょう 是两拍：きょ + う；不是把 kyo 当作英语单词来读。'],
 ['助词有特殊读法','は 作主题助词读 wa；へ 作方向助词读 e；を 作宾格助词通常读 o。其他词里的 は、へ 按通常读法。','わたしは wa ／ 東京へ e ／ 水を o','不能把整张表里的 は、へ 全改成 wa、e。'],
 ['拨音与元音清化','ん 的发音位置受后音影响。i、u 在某些清辅音环境中常清化，听起来很轻，但书写和节拍仍保留。','さんぽ 的 ん 接近 m ／ すき 的 u 常清化','不要把所有 ん 固定读成 n；清化也不是可以随意删去假名。'],
 ['声调与罗马字的边界','东京式日语有高低音调和音调核。假名表只帮助读出音段，不能给每个词的声调答案；罗马字也不代表英语发音。','し shi ／ ち chi ／ つ tsu ／ ふ fu','词汇学习时听整词与句子；会读五十音不等于已经掌握所有发音。']
];
const koreanRules=[
 ['一个方块，就是一个音节','初声和中声必需，终声可选；元音开头也要用 ㅇ 占初声位置。竖向元音通常在右，横向元音通常在下方。','ㄱ + ㅏ → 가 ／ ㅎ + ㅏ + ㄴ → 한','拼字器只组合字形，不能据此自动推断词中的全部音变。'],
 ['平音、紧音、送气音','比较气流、喉部紧张度与起音；紧音不是更长或更大声。现代首尔语还利用音高等线索区分部分起始音。','ㄱ / ㄲ / ㅋ ／ ㄷ / ㄸ / ㅌ ／ ㅂ / ㅃ / ㅍ','只拿英语的清浊对立去套韩语，容易混淆这三组。'],
 ['收音：先闭住，不额外爆破','词末或辅音前的单收音可按七类代表音入门。塞音收音 [k̚ t̚ p̚] 闭住后不爆破，不要补一个元音。','밖 → [박] ／ 옷 → [옫] ／ 꽃 → [꼳]','后续是元音或其他辅音时，可能出现连音、同化等，不能始终只读代表音。'],
 ['连音：后面是元音时重新衔接','收音接以 ㅇ 开头的音节时，在适用条件下转到后一个音节发出；原来不发音的初声 ㅇ 不构成阻碍。','한국어 → [한구거] ／ 옷이 → [오시]','复合词边界、助词与实词的衔接、双收音等有细则。'],
 ['鼻音化与流音化','塞音收音遇 ㄴ / ㅁ 常鼻音化；ㄴ 与 ㄹ 相邻时在常见条件下成为 ㄹㄹ。','국물 → [궁물] ／ 신라 → [실라]','不是看见 ㄴ、ㄹ 就一律改写；外来词、词界与例外仍需核对。'],
 ['ㅎ：送气化与脱落','ㅎ 与相邻平音塞音/塞擦音结合时可产生送气音；在某些元音相接环境中会脱落。','좋다 → [조타] ／ 좋아 → [조아]','不能把所有位置的 ㅎ 删除。'],
 ['腭化与紧音化','ㄷ / ㅌ 收音接某些以 이 开头的语法形式时可腭化；塞音收音后常发生后续平音紧音化。','같이 → [가치] ／ 학교 → [학꾜]','音变有语法和语音条件，不能只按字母顺序机械替换。'],
 ['双收音：不是两个都爆破','根据所接音、词形与规定，选择保留、分开连读或发生其他变化。读词时要核对词典。','앉다 → [안따] ／ 앉아 → [안자] ／ 읽다 → [익따] ／ 읽어 → [일거]','双收音不能统一只读左边或右边；例如 읽고 的读法还有具体规则。'],
 ['相近元音与 ㅢ 的位置','现代首尔语 ㅐ / ㅔ 常接近或合流；ㅚ 常读 we。ㅢ 在首音节、非首音节和属格助词位置有不同许可读法。','의사 的首个 의 ／ 우리의：属格 의 可读 [에]','本页按字母分类；「组合字形」不表示它一定是现代语音学上的双元音。']
];
(isJapanese?japaneseRules:koreanRules).forEach(([title,body,example,caution],index)=>{const rule=document.createElement('details');rule.className='rule';rule.innerHTML='<summary><span>'+String(index+1).padStart(2,'0')+'</span>'+title+'</summary><p>'+body+'</p><p class="example">'+example+'</p><p class="caution">留意：'+caution+'</p>';$('ruleGrid').append(rule);});
function nextPractice(){const pool=items.filter(x=>group==='all'||x.group===group),choices=pool.filter(x=>x.id!==practiceItem?.id);practiceItem=(choices.length?choices:pool)[Math.floor(Math.random()*(choices.length||pool.length))];$('practiceGlyph').textContent=glyph(practiceItem);$('practiceAnswer').hidden=true;$('practiceAnswer').textContent=practiceItem.roma+(isJapanese?' · '+practiceItem.hira+' / '+practiceItem.kata:' · '+practiceItem.name);$('practiceListen').disabled=true;$('reveal').disabled=false;}
$('nextPractice').addEventListener('click',nextPractice);$('reveal').addEventListener('click',()=>{$('practiceAnswer').hidden=false;$('practiceListen').disabled=false;$('reveal').disabled=true;});$('practiceListen').addEventListener('click',()=>play(practiceItem));
if(!isJapanese){
 const consonants=items.filter(x=>['consonants','tense'].includes(x.group)),vowels=items.filter(x=>['vowels','compound'].includes(x.group)),finals=['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
 for(const [id,list] of [['initial',consonants],['medial',vowels]])for(const item of list){const option=document.createElement('option');option.value=item.index;option.textContent=item.char+' · '+item.roma;$(id).append(option);}
 finals.forEach((char,index)=>{const option=document.createElement('option');option.value=index;option.textContent=char||'无收音';$('final').append(option);});
 function compose(){const initial=Number($('initial').value),medial=Number($('medial').value),final=Number($('final').value);$('syllable').textContent=String.fromCharCode(0xAC00+(initial*21+medial)*28+final);$('composition').textContent=consonants.find(x=>x.index===initial).char+' + '+vowels.find(x=>x.index===medial).char+(final?' + '+finals[final]:'');}
 for(const id of ['initial','medial','final'])$(id).addEventListener('change',compose);compose();
}
renderMap();renderDetail();nextPractice();

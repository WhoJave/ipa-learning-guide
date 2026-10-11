'use strict';
const $=id=>document.getElementById(id);
let accent='uk',category='all',selected='i',pairIndex=0,lastAudio=null,requestId=0;
let mastered=new Set();try{const stored=JSON.parse(localStorage.getItem('sound-atlas-mastered')||'[]');if(Array.isArray(stored))mastered=new Set(stored.filter(x=>CONTENT.sounds.some(s=>s.id===x)||x==='rhotic'));}catch{}
const audio=$('audio'),status=$('playerStatus');
function setStatus(text){status.textContent=text;}
function asset(file){const info=ASSETS[file];return info?.status==='decoded'?'audio/'+file:info?.url;}
function halt(){requestId++;audio.pause();audio.removeAttribute('src');audio.load();document.body.classList.remove('playing');}
async function playFile(file,label){
 const url=asset(file);halt();const ticket=requestId;lastAudio={file,label};$('replay').disabled=false;
 if(!url){setStatus('此录音未配置，请使用详情中的 Cambridge 核对入口。');return false;}
 setStatus('正在加载：'+label);audio.src=url;
 const timeout=setTimeout(()=>{if(ticket===requestId&&audio.readyState<2){halt();setStatus('录音加载超时。请重播，或在 Cambridge 听原词录音。');}},12000);
 try{await audio.play();clearTimeout(timeout);if(ticket!==requestId)return false;document.body.classList.add('playing');setStatus('正在播放：'+label);return true;}
 catch(error){clearTimeout(timeout);if(ticket!==requestId)return false;document.body.classList.remove('playing');setStatus('录音暂不可播放。请检查网络或打开 Cambridge 核对；未使用合成音替代。');return false;}
}
audio.addEventListener('ended',()=>{document.body.classList.remove('playing');setStatus('播放完毕。'+(lastAudio?.label||'')+' · 可以跟读一次。');});
$('stop').addEventListener('click',()=>{halt();setStatus('已停止播放。');});
$('replay').addEventListener('click',()=>{if(lastAudio)playFile(lastAudio.file,lastAudio.label);});
function wordPlay(word,a=accent){return playFile(word+'-'+(a==='uk'?'gb':'us')+'.mp3',(a==='uk'?'英式':'美式')+'整词 · '+word);}
function phonemePlay(item){return accent==='uk'&&item.id!=='rhotic'?playFile('ipa-'+item.id+'.mp3','英式单音示范 /'+item.uk+'/'):wordPlay(item.word,'us');}
const allSounds=()=>accent==='us'?[...CONTENT.sounds,...CONTENT.extra]:CONTENT.sounds;
function getSelected(){return allSounds().find(x=>x.id===selected)||CONTENT.sounds[0];}
function persist(){try{localStorage.setItem('sound-atlas-mastered',JSON.stringify([...mastered]));}catch{}updateProgress();}
function updateProgress(){const items=allSounds(),count=items.filter(s=>mastered.has(s.id)).length;$('progressText').textContent=count+' / '+items.length+' 个已掌握';$('progressFill').style.width=(count/items.length*100)+'%';}
function renderMap(){const query=$('search').value.trim().toLowerCase();const sounds=allSounds().filter(s=>(category==='all'||s.cat===category)&&[s.uk,s.us,s.word,s.note].some(v=>v.toLowerCase().includes(query)));$('soundGrid').replaceChildren();$('empty').hidden=sounds.length>0;
 $('mapNote').textContent=accent==='uk'?'GB · 传统英式音素示范。点击符号听单音，详情中可听整词。':'US · 通用美式映射。点击播放例词中的目标音（整词录音），不冒充独立美式音素。';
 for(const [cat,title,en] of [['v','单元音','MONOPHTHONGS'],['d',accent==='uk'?'双元音':'双元音与 R 组合','DIPHTHONGS & R'],['c','辅音','CONSONANTS']]){
 const list=sounds.filter(s=>s.cat===cat);if(!list.length)continue;const h=document.createElement('div');h.className='group-heading';h.innerHTML='<b>'+title+' <small>· '+list.length+'</small></b><span>'+en+'</span>';$('soundGrid').append(h);const grid=document.createElement('div');grid.className='sound-grid';
 for(const s of list){const btn=document.createElement('button');btn.type='button';btn.className='sound-card'+(s.id===selected?' active':'');btn.setAttribute('aria-label','听'+(accent==='uk'?'英式单音':'美式例词')+' /'+s[accent]+'/ · '+s.word);btn.setAttribute('aria-pressed',String(s.id===selected));btn.innerHTML='<span class="card-play">▶</span><span class="symbol">'+s[accent]+'</span><span class="word">'+s.word+'</span>'+(mastered.has(s.id)?'<span class="mastered-dot">●</span>':'');btn.addEventListener('click',()=>{selected=s.id;renderMap();renderDetail();phonemePlay(s);});grid.append(btn);} $('soundGrid').append(grid);
 }updateProgress();}
function renderDetail(){const s=getSelected();const isUK=accent==='uk';$('soundDetail').innerHTML=`<div class="detail-label"><span>SOUND SPOTLIGHT</span><span>${isUK?'GB':'US'}</span></div><div class="detail-symbol">/${s[accent]}/</div><div class="detail-word">${s.word}</div><div class="detail-buttons"><button id="detailPlay">▶ ${isUK?'听单音示范':'听美式例词中的目标音'}</button><button class="secondary" id="detailWord">▶ 听${isUK?'英式':'美式'}整词</button></div><h4>怎么发这个音？</h4><p>${s.note}</p><h4>英 / 美符号对照</h4><p>GB /${s.uk}/ → US /${s.us}/</p><button class="mark-button" id="markSound" aria-pressed="${mastered.has(s.id)}">${mastered.has(s.id)?'✓ 已掌握 · 点击取消':'＋ 标记为已掌握'}</button><a class="detail-link" target="_blank" rel="noreferrer" href="https://dictionary.cambridge.org/pronunciation/english/${s.word}">在 Cambridge 核对原词 ↗</a><small>${isUK?'单音：Oxford 教学录音来源链。':'发音：美式整词录音，非单独音素。'} 声音保持原速。</small>`;
 $('detailPlay').addEventListener('click',()=>phonemePlay(s));$('detailWord').addEventListener('click',()=>wordPlay(s.word));$('markSound').className='mark-button'+(mastered.has(s.id)?' marked':'');$('markSound').addEventListener('click',()=>{if(mastered.has(s.id))mastered.delete(s.id);else mastered.add(s.id);persist();renderMap();renderDetail();});}
$('accentToggle').addEventListener('click',e=>{const b=e.target.closest('[data-accent]');if(!b)return;halt();accent=b.dataset.accent;if(selected==='rhotic'&&accent==='uk')selected='schwa';for(const btn of $('accentToggle').children)btn.setAttribute('aria-pressed',String(btn===b));setStatus('已切换'+(accent==='uk'?'英式单音示范':'美式例词定位')+'。');renderMap();renderDetail();renderPair();});
$('categoryToggle').addEventListener('click',e=>{const b=e.target.closest('[data-cat]');if(!b)return;category=b.dataset.cat;for(const btn of $('categoryToggle').children)btn.classList.toggle('selected',btn===b);renderMap();});
$('search').addEventListener('input',renderMap);
$('resetProgress').addEventListener('click',()=>{mastered.clear();persist();renderMap();renderDetail();setStatus('已重置学习记录。');});
$('heroListen').addEventListener('click',()=>playFile('ipa-i.mp3','英式单音示范 /iː/'));
function renderComparison(){for(const [word,uk,us,title,note] of CONTENT.diffs){const tr=document.createElement('tr');tr.innerHTML=`<td><b>${word}</b><small>${title}</small></td><td><button class="pron-button" aria-label="听 ${word} 英式读音">/${uk}/ <span>▶</span></button></td><td><button class="pron-button" aria-label="听 ${word} 美式读音">/${us}/ <span>▶</span></button></td><td>${note}</td>`;tr.querySelectorAll('button')[0].addEventListener('click',()=>wordPlay(word,'uk'));tr.querySelectorAll('button')[1].addEventListener('click',()=>wordPlay(word,'us'));$('comparison').append(tr);}}
function renderRules(filter='all'){$('ruleGrid').replaceChildren();CONTENT.rules.forEach(([tag,title,body,example,exception],i)=>{if(filter!=='all'&&filter!==tag)return;const detail=document.createElement('details');detail.className='rule';detail.innerHTML=`<summary><span class="rule-number">${String(i+1).padStart(2,'0')}</span>${title}<span class="rule-tag">${tag}</span></summary><div class="rule-body">${body}<div class="rule-example">${example}</div><div class="rule-exception">留意：${exception}</div></div>`;$('ruleGrid').append(detail);});}
$('ruleFilters').addEventListener('click',e=>{const b=e.target.closest('[data-rule]');if(!b)return;for(const btn of $('ruleFilters').children)btn.classList.toggle('selected',btn===b);renderRules(b.dataset.rule);});
function renderPair(){const pair=CONTENT.pairs[pairIndex];$('pairTitle').textContent=pair[0]+' / '+pair[1];$('pairNote').textContent=pair[2]+' · '+pair[3];$('pairButtons').replaceChildren();for(const word of pair.slice(0,2)){const b=document.createElement('button');b.innerHTML='▶ '+word+'<small>'+(accent==='uk'?'GB · 英式整词':'US · 美式整词')+'</small>';b.addEventListener('click',()=>wordPlay(word));$('pairButtons').append(b);}for(const [i,b] of [...$('pairList').children].entries()){b.classList.toggle('active',i===pairIndex);b.setAttribute('aria-pressed',String(i===pairIndex));}}
CONTENT.pairs.forEach((p,i)=>{const b=document.createElement('button');b.className='pair-choice';b.innerHTML='<b>'+p[0]+' / '+p[1]+'</b><small>'+p[2]+'</small>';b.addEventListener('click',()=>{pairIndex=i;renderPair();});$('pairList').append(b);});
for(const h of [8,16,24,36,26,18,32,42,30,16,24,10,6]){const i=document.createElement('i');i.style.height=h+'px';document.querySelector('.wave').append(i);}
const records=Object.values(ASSETS),decoded=records.filter(x=>x.status==='decoded').length;$('assetSummary').textContent=`本地录音：${decoded} / ${records.length} 项完成下载与解码检查。未逐条完成语音教师听审；录音不可用时显示失败提示。`;
renderMap();renderDetail();renderComparison();renderRules();renderPair();

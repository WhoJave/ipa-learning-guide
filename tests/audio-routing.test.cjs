const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const vm=require('node:vm');
const root=path.join(__dirname,'../dist');
const content=JSON.parse(fs.readFileSync(path.join(root,'content.json'),'utf8'));
const report=JSON.parse(fs.readFileSync(path.join(root,'assets-report.json'),'utf8'));
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function setup(){
 const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'https://whojave.github.io/ipa-learning-guide/',runScripts:'outside-only'});
 const w=dom.window,played=[];let behaviour=()=>Promise.resolve();
 w.HTMLMediaElement.prototype.pause=function(){};
 w.HTMLMediaElement.prototype.load=function(){};
 w.HTMLMediaElement.prototype.play=function(){played.push(this.getAttribute('src'));return behaviour();};
 for(const file of ['data.js','assets.js','app.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),dom.getInternalVMContext(),{filename:file});
 return {w,dom,played,click:selector=>w.document.querySelector(selector).click(),src:()=>w.document.getElementById('audio').getAttribute('src'),status:()=>w.document.getElementById('playerStatus').textContent,setPlay:fn=>behaviour=fn};
}
test('all 44 GB and 45 US cards route to bundled phoneme audio, never a word',async()=>{
 const app=setup();try{
 for(const accent of ['uk','us']){
  app.click(`[data-accent="${accent}"]`);
  const sounds=accent==='uk'?content.sounds:[...content.sounds,...content.extra];
  assert.equal(app.w.document.querySelectorAll('.sound-card').length,sounds.length);
  for(const sound of sounds){
   // Locate the card by unique example and symbol, independent of category order.
   const card=[...app.w.document.querySelectorAll('.sound-card')].find(b=>b.querySelector('.word').textContent===sound.word&&b.querySelector('.symbol').textContent===sound[accent]);
   assert.ok(card,sound.id);card.click();await tick();
   const file=`ipa-${accent==='us'?'us-':''}${sound.id}.mp3`;
   assert.equal(app.src(),`audio/${file}`);
   assert.ok(report.some(r=>r.file===file&&r.status==='decoded'));
   assert.ok(fs.existsSync(path.join(root,'audio',file)));
   assert.ok(!app.status().includes('整词'));
   const component=accent==='us'&&['near','square','cure'].includes(sound.id);
   assert.equal(app.status().includes('组合分音'),component);
  }
 }
 }finally{app.dom.window.close();}
});
test('detail sound and word actions remain distinct in both accents; replay follows last action',async()=>{
 const app=setup();try{
 for(const accent of ['uk','us']){
  app.click(`[data-accent="${accent}"]`);
  app.click('#detailPlay');await tick();
  assert.equal(app.src(),`audio/ipa-${accent==='us'?'us-':''}i.mp3`);
  app.click('#detailWord');await tick();
  assert.equal(app.src(),`audio/see-${accent==='uk'?'gb':'us'}.mp3`);
  assert.match(app.status(),/整词/);
  app.click('#replay');await tick();assert.equal(app.src(),`audio/see-${accent==='uk'?'gb':'us'}.mp3`);
 }
 }finally{app.dom.window.close();}
});
test('accent switch stops pending audio, clears replay, and ignores stale play completion',async()=>{
 const app=setup();try{
 let finish;app.setPlay(()=>new Promise(resolve=>finish=resolve));
 app.click('#detailPlay');const staleFinish=finish;
 app.click('[data-accent="us"]');
 assert.equal(app.src(),null);assert.ok(app.w.document.getElementById('replay').disabled);
 staleFinish();await tick();assert.ok(!app.w.document.body.classList.contains('playing'));assert.match(app.status(),/已切换美式/);
 app.setPlay(()=>Promise.resolve());app.click('#detailPlay');await tick();assert.equal(app.src(),'audio/ipa-us-i.mp3');
 app.click('#stop');assert.equal(app.src(),null);assert.match(app.status(),/已停止/);
 app.click('#replay');await tick();assert.equal(app.src(),'audio/ipa-us-i.mp3');
 }finally{app.dom.window.close();}
});
test('failed playback reports failure without routing to a word or synthetic fallback',async()=>{
 const app=setup();try{
 app.click('[data-accent="us"]');app.setPlay(()=>Promise.reject(new Error('decode failed')));
 app.click('#detailPlay');await tick();assert.match(app.status(),/录音暂不可播放/);
 assert.deepEqual(app.played,['audio/ipa-us-i.mp3']);assert.ok(!app.w.document.body.classList.contains('playing'));
 app.setPlay(()=>Promise.resolve());app.click('#replay');await tick();assert.match(app.status(),/正在播放：美式单音/);
 app.w.document.getElementById('audio').dispatchEvent(new app.w.Event('ended'));assert.match(app.status(),/播放完毕/);
 }finally{app.dom.window.close();}
});
test('a later click wins even if an earlier play promise completes last',async()=>{
 const app=setup();try{
 let finish;app.setPlay(()=>new Promise(resolve=>finish=resolve));app.click('#detailPlay');const old=finish;
 app.setPlay(()=>Promise.resolve());app.click('#detailWord');await tick();old();await tick();
 assert.equal(app.src(),'audio/see-gb.mp3');assert.match(app.status(),/正在播放：英式整词/);
 }finally{app.dom.window.close();}
});

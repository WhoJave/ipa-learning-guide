const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {JSDOM}=require('jsdom');
const root=path.join(__dirname,'../dist');
const data=JSON.parse(fs.readFileSync(path.join(root,'language-content.json'),'utf8'));
const report=JSON.parse(fs.readFileSync(path.join(root,'language-audio-report.json'),'utf8'));
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function setup(language,stored={}){
 const dom=new JSDOM(fs.readFileSync(path.join(root,language,'index.html'),'utf8'),{url:`https://whojave.github.io/ipa-learning-guide/${language}/index.html`,runScripts:'outside-only'});
 const w=dom.window,played=[];let behaviour=()=>Promise.resolve();
 w.HTMLMediaElement.prototype.pause=function(){};w.HTMLMediaElement.prototype.load=function(){};
 w.HTMLMediaElement.prototype.play=function(){played.push(this.getAttribute('src'));return behaviour();};
 for(const [key,value] of Object.entries(stored))w.localStorage.setItem(key,value);
 for(const file of ['language-data.js','language-assets.js','languages.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),dom.getInternalVMContext(),{filename:file});
 return {w,dom,played,click:selector=>w.document.querySelector(selector).click(),src:()=>w.document.getElementById('audio').getAttribute('src'),status:()=>w.document.getElementById('playerStatus').textContent,setPlay:fn=>behaviour=fn};
}
for(const language of ['japanese','korean']){
 test(`${language}: every card and detail button play the declared local clip`,async()=>{
  const app=setup(language);try{
   assert.equal(app.w.document.querySelector('.sound-card.active')?.dataset.id,language==='japanese'?'ja-3042':'ko-314f');
   app.click('[data-group="all"]');assert.equal(app.w.document.querySelectorAll('.sound-card').length,data[language].length);
   for(const item of data[language]){
    app.click(`[data-id="${item.id}"]`);await tick();assert.equal(app.src(),'../language-audio/'+item.audio);
    app.click('#detailPlay');await tick();assert.equal(app.src(),'../language-audio/'+item.audio);
    assert.ok(fs.existsSync(path.join(root,'language-audio',item.audio)));
    const record=report.find(x=>x.file===item.audio);assert.equal(record.label,item.hira||item.char);assert.equal(record.status,'decoded');
    assert.match(app.status(),/正在播放/);assert.ok(!app.src().includes('../audio/'));
   }
  }finally{app.dom.window.close();}
 });
 test(`${language}: filtering, progress isolation, practice reveal, stop and replay`,async()=>{
  const app=setup(language,{'sound-atlas-mastered':'["i"]'});try{
   app.click('#markSound');assert.match(app.w.document.getElementById('progressText').textContent,/1 \/ /);
   assert.equal(app.w.localStorage.getItem('sound-atlas-mastered'),'["i"]');assert.equal(JSON.parse(app.w.localStorage.getItem('sound-atlas-'+language+'-mastered')).length,1);
   app.click('[data-group="all"]');const input=app.w.document.getElementById('search');input.value='no such letter 123';input.dispatchEvent(new app.w.Event('input'));assert.equal(app.w.document.querySelectorAll('.sound-card').length,0);assert.equal(app.w.document.getElementById('empty').hidden,false);
   input.value=language==='japanese'?'ア':'ㅏ';input.dispatchEvent(new app.w.Event('input'));assert.ok(app.w.document.querySelectorAll('.sound-card').length>0);
   assert.ok(app.w.document.getElementById('practiceAnswer').hidden);app.click('#reveal');assert.equal(app.w.document.getElementById('practiceAnswer').hidden,false);
   app.click('#practiceListen');await tick();const played=app.src();assert.ok(played);app.click('#stop');assert.equal(app.src(),null);app.click('#replay');await tick();assert.equal(app.src(),played);
   app.click('#nextPractice');assert.ok(app.w.document.getElementById('practiceAnswer').hidden);assert.ok(app.w.document.getElementById('practiceListen').disabled);
   app.click('#resetProgress');assert.match(app.w.document.getElementById('progressText').textContent,/0 \/ /);
  }finally{app.dom.window.close();}
 });
 test(`${language}: stale playback cannot overwrite a later selection; failures stay visible`,async()=>{
  const app=setup(language);try{
   let finish;app.setPlay(()=>new Promise(resolve=>finish=resolve));app.click('#detailPlay');const stale=finish;
   app.setPlay(()=>Promise.resolve());app.click('[data-group="all"]');app.click(`[data-id="${data[language][1].id}"]`);await tick();const status=app.status();stale();await tick();assert.equal(app.status(),status);
   app.setPlay(()=>Promise.reject(new Error('offline')));app.click('#detailPlay');await tick();assert.match(app.status(),/暂不可播放/);assert.ok(!app.w.document.body.classList.contains('playing'));
   app.setPlay(()=>Promise.resolve());app.click('#replay');await tick();app.w.document.getElementById('audio').dispatchEvent(new app.w.Event('error'));assert.equal(app.src(),null);assert.match(app.status(),/加载失败/);
  }finally{app.dom.window.close();}
 });
}
test('Japanese modes preserve reading and audio; category counts are 46 / 25 / 33',async()=>{
 const app=setup('japanese');try{
 for(const [group,count] of [['basic',46],['voiced',25],['contracted',33]]){app.click(`[data-group="${group}"]`);assert.equal(app.w.document.querySelectorAll('.sound-card').length,count);}
 app.click('[data-group="all"]');app.click('[data-script="kata"]');
 for(const item of data.japanese){const card=app.w.document.querySelector(`[data-id="${item.id}"]`);assert.equal(card.querySelector('.glyph').textContent,item.kata);card.click();await tick();assert.equal(app.src(),'../language-audio/'+item.audio);}
 app.click('[data-script="hira"]');assert.equal(app.w.document.querySelector('.sound-card .glyph').textContent,'あ');
 assert.notEqual(data.japanese.find(x=>x.hira==='じ').id,data.japanese.find(x=>x.hira==='ぢ').id);
 }finally{app.dom.window.close();}
});
test('Korean 40 letters and composer handle known syllables, silent initial, compound vowel and double final',async()=>{
 const app=setup('korean');try{
 for(const [group,count] of [['vowels',10],['compound',11],['consonants',14],['tense',5]]){app.click(`[data-group="${group}"]`);assert.equal(app.w.document.querySelectorAll('.sound-card').length,count);}
 function compose(i,m,f){for(const [id,value] of [['initial',i],['medial',m],['final',f]]){const el=app.w.document.getElementById(id);el.value=value;el.dispatchEvent(new app.w.Event('change'));}return app.w.document.getElementById('syllable').textContent;}
 assert.equal(compose(0,0,0),'가');assert.equal(compose(18,0,4),'한');assert.equal(compose(0,18,8),'글');assert.equal(compose(11,0,0),'아');assert.equal(compose(0,9,0),'과');assert.equal(compose(0,0,18),'값');assert.equal(compose(18,20,27),'힣');
 app.click('[data-group="all"]');app.click('[data-id="ko-3147"]');assert.match(app.w.document.getElementById('soundDetail').textContent,/声母位置不发音/);assert.match(app.w.document.getElementById('detailPlay').textContent,/收音 ng/);await tick();
 }finally{app.dom.window.close();}
});
test('new HTML references resolve locally and original English entry remains separate',()=>{
 for(const file of ['languages.html','japanese/index.html','korean/index.html']){
  const dom=new JSDOM(fs.readFileSync(path.join(root,file),'utf8'));try{
   for(const el of dom.window.document.querySelectorAll('[src],[href]')){const ref=el.getAttribute('src')||el.getAttribute('href');if(ref&&!/^(https?:|#)/.test(ref))assert.ok(fs.existsSync(path.resolve(root,path.dirname(file),ref)),`${file}: ${ref}`);}
  }finally{dom.window.close();}
 }
 assert.equal(report.length,144);assert.equal(new Set(report.map(x=>x.file)).size,144);
});

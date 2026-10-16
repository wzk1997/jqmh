const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function fixture(seed){
 const storage=new Map(seed?[['WT_READING_PREFERENCES_V1',seed]]:[]),pages=[{route:'projects/TRIP1/pages/default/index/default_index',data:{waterfallItems:[{id:'existing-card'}],heroIndex:2},setData(v){Object.assign(this.data,v);}}];
 const wx={getStorageSync:k=>storage.get(k),setStorageSync:(k,v)=>storage.set(k,structuredClone(v))};
 const mod={exports:{}};vm.runInNewContext(fs.readFileSync('miniprogram/helper/reading_helper.js','utf8'),{module:mod,wx,getCurrentPages:()=>pages});
 const helper=mod.exports;let definition;const tabBar={data:{},setData(v){Object.assign(this.data,v);}};pages[0].getTabBar=()=>tabBar;
 vm.runInNewContext(fs.readFileSync('miniprogram/cmpts/public/reading_tools/reading_tools.js','utf8'),{Component:v=>definition=v,require:()=>helper});
 const component={...definition.methods,data:structuredClone(definition.data),setData(v){Object.assign(this.data,v);}};
 return {helper,definition,component,pages,storage,tabBar};
}
test('display choice migrates old font preferences and persists only a validated device-local display mode',()=>{
 const f=fixture({level:'nonsense',position:{x:1,y:0}});assert.equal(f.helper.selected().scale,1);assert.deepEqual(Object.keys(f.helper.get()),['mode']);
 let count=0;const unsub=f.helper.subscribe(()=>count++);
 assert.equal(f.helper.choose('enlarged'),true);assert.equal(f.pages[0].data.wtFontScale,1.3);assert.equal(f.pages[0].data.wtDisplayMode,'enlarged');assert.equal(f.tabBar.data.wtDisplayMode,'enlarged');assert.equal(count,1);
 assert.equal(f.helper.choose('invalid'),false);assert.equal(f.helper.choose('enlarged'),true);assert.equal(count,1);
 const restored=fixture(f.storage.get(f.helper.KEY));assert.equal(restored.helper.get().mode,'enlarged');
 for(const old of ['large','extra'])assert.equal(fixture({level:old}).helper.get().mode,'enlarged');
 unsub();f.helper.choose('standard');assert.equal(count,1);assert.equal(f.pages[0].data.wtFontScale,1);
});
test('display changes preserve loaded content and carousel state and synchronize every mounted page',()=>{
 const f=fixture(),list=f.pages[0].data.waterfallItems;
 const secondary={data:{items:[{id:'guide'}],category:'weekend'},setData(v){Object.assign(this.data,v);}};f.pages.push(secondary);
 f.helper.choose('enlarged');assert.equal(f.pages[0].data.waterfallItems,list);assert.equal(f.pages[0].data.heroIndex,2);assert.equal(secondary.data.items[0].id,'guide');assert.equal(secondary.data.category,'weekend');assert.equal(secondary.data.wtDisplayMode,'enlarged');
 f.helper.choose('standard');assert.equal(f.pages[0].data.waterfallItems,list);assert.equal(secondary.data.wtFontScale,1);
});
test('floating preference synchronizes when returning to a page and releases its subscription when removed',()=>{
 const f=fixture(),c=f.component;f.definition.lifetimes.attached.call(c);c.choose({currentTarget:{dataset:{id:'enlarged'}}});assert.equal(c.data.mode,'enlarged');assert.equal(f.pages[0].data.wtFontScale,1.3);
 f.definition.lifetimes.detached.call(c);f.helper.choose('standard');assert.equal(c.data.mode,'enlarged');f.definition.pageLifetimes.show.call(c);assert.equal(c.data.mode,'standard');
 assert.equal(typeof c.show,'undefined');assert.equal(typeof c.startDrag,'undefined');
});
test('enlarged news uses a full-width column in source order, larger photos and restores the original two columns',()=>{
 let config;const ui=require('../miniprogram/projects/TRIP1/ui/content_ui.js');vm.runInNewContext(fs.readFileSync('miniprogram/cmpts/biz/news_waterfall/news_waterfall.js','utf8'),{Component:c=>config=c,require:n=>n.includes('content_ui')?ui:{}});
 const items=Array.from({length:5},(_,i)=>({id:String(i+1),type:'news',title:'活动'+i,pic:'/photo-'+i+'.jpg'}));
 const c={...config.methods,data:{...config.data,items,enlarged:true,compact:true},setData(v){Object.assign(this.data,v);}};c.layoutItems();
 assert.equal(c.data.columns.length,1);assert.deepEqual(Array.from(c.data.columns[0],row=>row.id),items.map(row=>row.id));assert(c.data.columns[0].every(row=>row.imageHeight===360));
 c.imageLoaded({currentTarget:{dataset:{key:'news:1'}},detail:{width:200,height:100}});assert.equal(c.data.columns[0][0].imageHeight,360);
 c.data.enlarged=false;c.layoutItems();assert.equal(c.data.columns.length,2);assert.equal(c.data.columns.flat().length,5);assert(c.data.columns.flat().every(row=>row.imageHeight===180));assert.equal(c.data.items,items);
});
test('visitor pages expose one floating display switch and leave external webview untouched',()=>{
 const app=JSON.parse(fs.readFileSync('miniprogram/app.json','utf8'));const routes=app.pages.concat(app.subpackages.flatMap(pack=>pack.pages.map(route=>pack.root+'/'+route)));
 for(const route of routes.filter(route=>route.startsWith('projects/TRIP1/')&&!route.includes('/pages/admin/'))){
  const source=fs.readFileSync('miniprogram/'+route+'.wxml','utf8');if(route.includes('/experience/webview/')){assert(!source.includes('<reading-tools'));continue;}
  assert(source.startsWith('<page-meta'),route);assert(source.includes('--wt-font-scale:{{wtFontScale||1}}'),route);assert(source.includes('<reading-tools id="readingTools"'),route);
  assert.equal((source.match(/<reading-tools /g)||[]).length,1,route);assert(!source.includes('inline="{{true}}"'),route);
 }
 const controls=fs.readFileSync('miniprogram/cmpts/public/reading_tools/reading_tools.wxml','utf8');assert(controls.includes('display-dock'));assert(controls.includes('aria-expanded'));assert(controls.includes('wx:if="{{expanded}}"'));assert(controls.includes('role="radio"'));
});
test('floating switch opens and closes independently of mode, preserves content and collapses on page hide',()=>{
 const f=fixture(),c=f.component;f.definition.lifetimes.attached.call(c);const content=f.pages[0].data.waterfallItems;
 assert.equal(c.data.expanded,false);c.toggle();assert.equal(c.data.expanded,true);
 c.choose({currentTarget:{dataset:{id:'enlarged'}}});assert.equal(c.data.expanded,true);assert.equal(c.data.mode,'enlarged');assert.equal(f.pages[0].data.waterfallItems,content);
 c.choose({currentTarget:{dataset:{id:'standard'}}});assert.equal(c.data.mode,'standard');assert.equal(c.data.expanded,true);
 c.toggle();assert.equal(c.data.expanded,false);c.toggle();f.definition.pageLifetimes.hide.call(c);assert.equal(c.data.expanded,false);
 assert.equal(f.helper.get().mode,'standard');c.toggle();f.definition.pageLifetimes.show.call(c);assert.equal(c.data.expanded,false);
});
test('home switches to its solid navigation before scrolled banner text can collide with the title',()=>{
 let config;vm.runInNewContext(fs.readFileSync('miniprogram/projects/TRIP1/pages/default/index/default_index.js','utf8'),{Page:c=>config=c,require:()=>({})});const page={...config,data:{homeNavMode:'home'},setData(v){Object.assign(this.data,v);}};
 page.onPageScroll({scrollTop:100});assert.equal(page.data.homeNavMode,'page');page.onPageScroll({scrollTop:0});assert.equal(page.data.homeNavMode,'home');
});

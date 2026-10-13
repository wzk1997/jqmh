const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function load(file,mocks={}){const filename=path.join(root,file),mod={exports:{}};vm.runInThisContext('(function(require,module,exports){'+fs.readFileSync(filename,'utf8')+'\n})',{filename})(n=>n in mocks?mocks[n]:require(n.startsWith('.')?path.resolve(path.dirname(filename),n):n),mod,mod.exports);return mod.exports;}
const display=require('../cloudfunctions/mcloud/project/TRIP1/service/news_display.js');
test('activity status respects inclusive dates and China midnight, without inventing status for missing dates',()=>{
 const start='2026-10-14',end='2026-10-15';
 assert.equal(display.activityState(start,end,Date.parse('2026-10-13T15:59:59Z')),'upcoming');
 assert.equal(display.activityState(start,end,Date.parse('2026-10-13T16:00:00Z')),'ongoing');
 assert.equal(display.activityState(start,end,Date.parse('2026-10-15T15:59:59Z')),'ongoing');
 assert.equal(display.activityState(start,end,Date.parse('2026-10-15T16:00:00Z')),'ended');
 assert.equal(display.activityState(start,''),'');assert.equal(display.activityState(end,start),'');
});
test('news scenic group intersects selected category and retains pagination and search',async()=>{
 let query;const Service=load('cloudfunctions/mcloud/project/TRIP1/service/news_service.js',{'./base_project_service.js':class{},'../model/news_model.js':{getList:async(...args)=>{query=args;return {list:[],total:0};}},'./cms_service.js':{categories:async()=>[{id:'activity'},{id:'tips'},{id:'2'}]}});
 const input={cateGroup:'scenic',cateId:'activity',page:3,size:6,search:'山水'};
 await new Service().getNewsList(input);assert.deepEqual(query[0].NEWS_CATE_ID,['in',['activity']]);assert.equal(query[0].NEWS_STATUS,1);assert.equal(query[3],3);assert.equal(query[4],6);assert(query[1].includes('NEWS_ACTIVITY_START'));assert(query[0].NEWS_TITLE);
 await new Service().getNewsList({...input,cateId:'2'});assert.deepEqual(query[0].NEWS_CATE_ID,['in',[]]);
});
test('news list keeps legacy keys and adds dates without requiring new fields on old records',()=>{
 const Controller=load('cloudfunctions/mcloud/project/TRIP1/controller/news_controller.js',{'./base_project_controller.js':class{},'../service/news_service.js':class{}}),c=new Controller();
 const old=c.transNewsList([{_id:'legacy',NEWS_TITLE:'旧资讯',NEWS_ADD_TIME:'2026-10-01'}])[0];assert.equal(old.ext,'2026-10-01');assert.equal(old.pic,'');assert.equal(old.publishDate,'');assert.equal(old.activityState,'');
 const row=c.transNewsList([{_id:'new',NEWS_TITLE:'活动',NEWS_ACTIVITY_START:'2026-01-01',NEWS_ACTIVITY_END:'2026-01-02',NEWS_PIC:['cover']}])[0];assert.equal(row.activityState,'ended');assert.equal(row.activityStateLabel,'已结束');assert.equal(row.pic,'cover');
});
test('waterfall normalization keeps publication priority and activity dates across repeated normalization',()=>{
 const ui=require('../miniprogram/projects/TRIP1/ui/content_ui.js');const item={id:'new',title:'活动',publishDate:'2026-10-10',ext:'2026-09-01',activityStart:'2026-10-11',activityEnd:'2026-10-14',activityStateLabel:'进行中'};
 const normalized=ui.normalizeContent(ui.normalizeContent(item));assert.equal(normalized.date,'2026.10.10');assert.equal(normalized.activityDate,'2026.10.11 — 2026.10.14');assert.equal(normalized.activityStateLabel,'进行中');
});

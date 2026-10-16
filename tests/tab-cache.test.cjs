const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function page(file,deps,extra={}){let config;vm.runInNewContext(fs.readFileSync('miniprogram/projects/TRIP1/pages/'+file,'utf8'),{Page:value=>config=value,require:name=>deps[name]||{},wx:{stopPullDownRefresh(){}},...extra});return {...config,data:structuredClone(config.data),setData(v){Object.assign(this.data,v)}};}
test('returning to homepage preserves loaded images, carousel position and list; pull refresh still loads',async()=>{
 let requests=0,sync=0;
 const p=page('default/index/default_index.js',{'../../../biz/project_biz.js':{syncTabBar:()=>sync++}});
 p._loadList=async()=>{requests++;p.setData({hasHomeLoaded:true});};
 await p.onShow();assert.equal(requests,1);
 const list=[{id:'news-1'}];p.setData({waterfallItems:list,heroIndex:2,heroImagesLoaded:{2:true},heroImageErrors:{}});
 p.onHide();await p.onShow();p.onHide();await p.onShow();
 assert.equal(requests,1);assert.equal(sync,3);assert.equal(p.data.heroIndex,2);assert.equal(p.data.heroImagesLoaded[2],true);assert.equal(p.data.waterfallItems,list);assert.equal(p.data.heroPlaying,true);
 await p.onPullDownRefresh();assert.equal(requests,2);
});
test('living tabs reuse their own loaded lists, preserve pagination and ignore repeated tab taps',async()=>{
 const requests=[];
 const p=page('about/service/about_service.js',{'../../../../../helper/cloud_helper.js':{callCloudSumbit:async(route,params)=>{requests.push(params);return {data:{total:31,list:[{_id:params.category+'-'+params.page,MERCHANT_NAME:'店铺',MERCHANT_IMAGES:['/pic.jpg']}]}};}},'../../../ui/content_ui.js':{normalizeContent:row=>row}});
 await p.load();await p.load(true);const food=p.data.merchants;
 await p.bindServiceTab({currentTarget:{dataset:{tab:'travel'}}});assert.equal(requests.length,3);
 await p.bindServiceTab({currentTarget:{dataset:{tab:'food'}}});assert.equal(requests.length,3);assert.equal(p.data.merchants,food);assert.equal(p.data.merchantPage,2);assert.equal(p.data.hasMore,false);
 await p.bindServiceTab({currentTarget:{dataset:{tab:'food'}}});assert.equal(requests.length,3);
});
test('returning from a service detail does not clear or refetch successful service entrances',async()=>{
 let requests=0;const p=page('about/visitor/visitor_index.js',{'../../../ui/service_ui.js':{load:async instance=>{requests++;instance.setData({servicesLoaded:true});}}});
 await p.onShow();await p.onShow();assert.equal(requests,1);await p.retryServices();assert.equal(requests,2);
});
test('travel tab requests only travel merchants and renders no convenience-service or guide entrances',async()=>{
 const calls=[];const p=page('about/service/about_service.js',{'../../../../../helper/cloud_helper.js':{callCloudSumbit:async(route,params)=>{calls.push({route,...params});return {data:{list:[],total:0}};}}});
 p.data.serviceTab='travel';await p.load();await p.onPullDownRefresh();
 assert.equal(calls.length,2);assert(calls.every(call=>call.route==='cms/list'&&call.module==='merchant'&&call.category==='travel'));
 const markup=fs.readFileSync('miniprogram/projects/TRIP1/pages/about/service/about_service.wxml','utf8');
 assert(!markup.includes('living-travel'));assert(!markup.includes('{{services}}'));assert(!markup.includes('album/index/album_index'));assert(!markup.includes('SETUP_CONTENT_'));
});

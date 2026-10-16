const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function load(file,mocks={}){const filename=path.join(root,file),mod={exports:{}};vm.runInThisContext('(function(require,module,exports){'+fs.readFileSync(filename,'utf8')+'\n})',{filename})(n=>n in mocks?mocks[n]:require(n.startsWith('.')?path.resolve(path.dirname(filename),n):n),mod,mod.exports);return mod.exports;}
function fixture(){let store=null;const rows={scenic:{_id:'park',SCENIC_NAME:'景区',SCENIC_STATE:'published',SCENIC_IMAGES:['cloud://cover'],SCENIC_INFO:{}},album:{_id:'route',ALBUM_TITLE:'路线',ALBUM_STATUS:1,ALBUM_OBJ:{cover:['cloud://route'],desc:'原内容'}}};class Cms{model(module){return {getOne:async q=>{const row=rows[module];return row&&row._id===q._id&&!row[module.toUpperCase()+'_DELETED']?structuredClone(row):null;}};}async ensure(){}async detail(module,id){const row=rows[module];if(!row||row._id!==id)throw Error('不存在');return structuredClone(row);}async checkImages(kind,id,images,previous){for(const image of images)if(!previous.includes(image))throw Error('图片不属于当前内容');}}
Cms.currentState=(kind,row)=>row[kind.toUpperCase()+'_STATE']||(row[kind.toUpperCase()+'_STATUS']===1?'published':'offline');
const Portal=load('cloudfunctions/mcloud/project/TRIP1/service/home_portal_service.js',{'../../../framework/utils/setup/setup_util.js':{get:async()=>structuredClone(store),replace:async(_,value)=>store=structuredClone(value)},'./admin/admin_cms_service.js':Cms,'./cms_service.js':{detail:async module=>structuredClone(rows[module])},'../../../framework/validate/content_check.js':{checkTextMultiAdmin:async()=>{}}});
return {Portal,service:new Portal(),rows,getStore:()=>store};}
const config={scenicId:'park',brandName:'WeTravel',slides:[{image:'cloud://cover',title:'山水相逢',enabled:true,target:{module:'album',id:'route'}}],featured:[{module:'album',id:'route'}]};
test('homepage validation allows only bounded typed references and excludes copied business fields',()=>{const {Portal}=fixture();const validated=Portal.validate({...config,featured:[{...config.featured[0],title:'伪造标题'}]});assert.deepEqual(validated.featured,config.featured);assert.throws(()=>Portal.validate({...config,slides:Array(9).fill(config.slides[0])}),/最多/);assert.throws(()=>Portal.validate({...config,featured:[{module:'meet',id:'tickets'}]}),/类型/);assert.throws(()=>Portal.validate({...config,featured:[config.featured[0],config.featured[0]]}),/重复/);});
test('homepage draft is isolated; publication resolves current business data and hides offline references',async()=>{const {service,rows,getStore}=fixture();await service.save(config,'admin');assert.equal((await service.portal()).configured,false);await service.publish('admin');let live=await service.portal();assert.equal(live.featured[0].title,'路线');assert.equal(live.slides.length,1);assert(!Object.hasOwn(getStore().published.featured[0],'title'));await service.save({...config,brandName:'未发布品牌'},'admin');assert.equal((await service.portal()).brandName,'WeTravel');rows.album.ALBUM_TITLE='已更新路线';assert.equal((await service.portal()).featured[0].title,'已更新路线');rows.album.ALBUM_STATUS=0;live=await service.portal();assert.equal(live.featured.length,0);assert.equal(live.slides.length,0);await assert.rejects(service.publish('admin'),/尚未发布/);});
test('homepage publication requires published scenic data; images from another record are rejected',async()=>{const {service,rows}=fixture();await assert.rejects(service.save({...config,slides:[{...config.slides[0],image:'cloud://other'}]}),/不属于/);await service.save(config,'admin');rows.scenic.SCENIC_STATE='draft';await assert.rejects(service.publish('admin'),/景区尚未发布/);});
test('all homepage administrator operations enforce identity and operation permission',async()=>{let allowed=false;class Base{async isAdmin(){if(!allowed)throw Error('登录');}requirePermission(module,op){if(op!=='read')throw Error('无写入权限');}}const Controller=load('cloudfunctions/mcloud/project/TRIP1/controller/admin/admin_portal_controller.js',{'./base_project_admin_controller.js':Base,'../../service/home_portal_service.js':class{get(){return {draft:null};}},'../../service/admin/admin_cms_service.js':class{}});const c=new Controller();c._request={};await assert.rejects(c.get(),/登录/);allowed=true;assert.equal((await c.get()).draft,null);for(const action of ['save','publish','upload'])await assert.rejects(c[action](),/权限/);});
test('configuration replacement uses a database set command to replace nulls and remove old nested keys',async()=>{let written;const util=load('cloudfunctions/mcloud/framework/utils/setup/setup_util.js',{'./setup_model.js':{CL:'bx_setup',getOne:async()=>({_id:'setup'}),insertOrUpdate(){throw Error('must replace');}},'../../database/db_util.js':{getCmd:()=>({set:value=>({replaceWhole:value})}),edit:async(collection,id,data)=>{written={collection,id,data};}}});await util.replace('SETUP_HOME_PORTAL',{published:{brandName:'WeTravel'},draft:null},'home_portal');assert.equal(written.id,'setup');assert.deepEqual(written.data.SETUP_VALUE,{replaceWhole:{val:{published:{brandName:'WeTravel'},draft:null}}});});

function homePage(cloudCall=async()=>({data:{}}), preview=false){
 let definition;const navigation=[];
 const filename=path.join(root,'miniprogram/projects/TRIP1/pages/default/index/default_index.js');
 const wx={navigateTo:options=>navigation.push(options.url),nextTick:fn=>fn(),getStorageSync:()=>false,getAccountInfoSync:()=>({miniProgram:{envVersion:'develop'}}),getDeviceInfo:()=>({platform:'devtools'})};
 vm.runInNewContext(fs.readFileSync(filename,'utf8'),{
  Page:value=>definition=value,wx,
  require:name=>name.includes('home_preview')?require('../miniprogram/projects/TRIP1/ui/home_preview.js'):name.includes('/setting/')?{HOME_UI_PREVIEW:preview}:name.includes('cloud_helper')?{callCloudSumbit:cloudCall}:name.includes('content_ui')?{normalizeContent:value=>value,mergeContent:(a,b)=>[...a,...b]}:name.includes('scene_config')?{heroImage:'/fallback.jpg'}:name.includes('project_biz')?{syncTabBar(){}}:{}
 },{filename});
 const page={...definition,data:structuredClone(definition.data),setData(values){for(const [key,value] of Object.entries(values)){const parts=key.split('.');let data=this.data;while(parts.length>1){const part=parts.shift();data=data[part]||(data[part]={});}data[parts[0]]=value;}}};
 return {page,navigation};
}
test('published carousel flows through home/portal into ordered frontend slides, excluding disabled and offline targets',async()=>{
 const {service,rows}=fixture();
 const slides=[
  {...config.slides[0],title:'第一张',subtitle:'第一张副标题',target:null},
  {...config.slides[0],title:'已停用',enabled:false,target:null},
  {...config.slides[0],title:'第二张',subtitle:'第二张副标题'},
 ];
 await service.save({...config,brandName:'园区品牌',slides},'test-admin');await service.publish('test-admin');
 const calls=[];const {page,navigation}=homePage(async route=>{calls.push(route);return {data:route==='home/portal'?await service.portal():{list:[]}};});
 await page._loadList();
 assert.deepEqual(calls,['home/portal','news/list']);
 assert.equal(page.data.portalBrandName,'园区品牌');
 assert.equal(page.data.heroSlides.length,2);assert.equal(page.data.heroSlides[0].title,'第一张');assert.equal(page.data.heroSlides[1].subtitle,'第二张副标题');
 assert.equal(page.data.heroIndex,0);
 page.bindHeroChange({detail:{current:1,source:'touch'}});assert.equal(page.data.heroIndex,1);
 page.heroTap({currentTarget:{dataset:{index:1}}});assert.deepEqual(navigation,['/projects/TRIP1/pages/album/detail/album_detail?id=route']);
 page.heroTap({currentTarget:{dataset:{index:0}}});assert.equal(navigation.length,1);
 page.bindHeroChange({detail:{current:0,source:'autoplay'}});assert.equal(page.data.heroIndex,0);
 page.bindHeroChange({detail:{current:10}});assert.equal(page.data.heroIndex,0);
 rows.album.ALBUM_STATUS=0;await page._loadList();assert.equal(page.data.heroSlides.length,1);assert.equal(page.data.heroSlides[0].title,'第一张');
});
test('carousel stops offscreen, resumes on show and resets index after configuration refresh',async()=>{
 const {page}=homePage(async route=>({data:route==='home/portal'?{configured:true,slides:[{image:'/one.jpg',title:'新配置'}],featured:[],scenic:null}:{list:[]}}));
 page.applyPortal({slides:[{image:'/one.jpg'},{image:'/two.jpg'}]});page.bindHeroChange({detail:{current:1}});
 page.onHide();assert.equal(page.data.heroPlaying,false);
 await page.onShow();assert.equal(page.data.heroPlaying,true);assert.equal(page.data.heroSlides.length,1);assert.equal(page.data.heroIndex,0);
 page.onUnload();assert.equal(page.data.heroPlaying,false);
 const markup=fs.readFileSync(path.join(root,'miniprogram/projects/TRIP1/pages/default/index/default_index.wxml'),'utf8');
 assert(markup.includes('autoplay="{{heroPlaying&&heroSlides.length>1}}"'));
 assert(markup.includes('circular="{{heroSlides.length>1}}"'));
 assert(markup.includes('{{heroIndex+1}}/{{heroSlides.length}}'));
});
test('carousel image failure can be retried without losing slides or current index; load clears error',()=>{
 const {page}=homePage();page.applyPortal({slides:[{image:'/one.jpg'},{image:'/two.jpg'}]});page.bindHeroChange({detail:{current:1}});
 const event={currentTarget:{dataset:{index:1}}};page.heroImageError(event);assert.equal(page.data.heroImageErrors[1],true);
 page.retryHero();assert.equal(page.data.heroRender,true);assert.equal(page.data.heroIndex,1);assert.equal(page.data.heroSlides.length,2);assert.equal(Object.keys(page.data.heroImageErrors).length,0);
 page.heroImageError(event);page.heroImageLoaded(event);assert.equal(page.data.heroImageErrors[1],false);assert.equal(page.data.heroImagesLoaded[1],true);
});
test('unconfigured or unavailable portal uses one fallback image and completes hero loading',async()=>{
 for(const rejectPortal of [false,true]){
  const {page}=homePage(async route=>{if(route==='home/portal'){if(rejectPortal)throw Error('local unavailable');return {data:{configured:false}};}return {data:route==='home/list'?[]:{list:[]}};});
  await page._loadList();assert.equal(page.data.heroLoading,false);assert.equal(page.data.heroSlides.length,1);assert.equal(page.data.heroSlides[0].image,'/fallback.jpg');assert.equal(page.data.heroIndex,0);
 }
});
test('retry keeps its error action visible while pending, prevents duplicate requests and clears error after success',async()=>{
 let finish;const pending=new Promise(resolve=>{finish=resolve;});const calls=[];
 const {page}=homePage(async route=>{calls.push(route);if(route==='home/portal'){await pending;return {data:{configured:true,slides:[],featured:[],scenic:null}};}return {data:{list:[]}};});
 page.setData({homeError:true,hasHomeLoaded:true});
 const loading=page._loadList();assert.equal(page.data.homeLoading,true);assert.equal(page.data.homeError,true);
 await page._loadList();assert.deepEqual(calls,['home/portal','news/list']);
 finish();await loading;assert.equal(page.data.homeLoading,false);assert.equal(page.data.homeError,false);
});
test('UI fixtures are available only in developer tools and never in trial or release builds',()=>{
 const {isEnabled}=require('../miniprogram/projects/TRIP1/ui/home_preview.js');
 const wx=(envVersion,platform)=>({getAccountInfoSync:()=>({miniProgram:{envVersion}}),getDeviceInfo:()=>({platform})});
 assert.equal(isEnabled(wx('develop','devtools'),{HOME_UI_PREVIEW:true}),true);
 for(const [env,platform] of [['trial','devtools'],['release','devtools'],['develop','ios'],['develop','android']])assert.equal(isEnabled(wx(env,platform),{HOME_UI_PREVIEW:true}),false);
 assert.equal(isEnabled(wx('develop','devtools'),{HOME_UI_PREVIEW:false}),false);
 assert.equal(isEnabled({}, {HOME_UI_PREVIEW:true}),false);
});
test('homepage UI preview displays local slides and news without calling backend APIs',async()=>{
 const {page}=homePage(async()=>assert.fail('UI preview must not call cloud APIs'),true);
 await page._loadList();
 assert.equal(page.data.homeUiPreview,true);assert.equal(page.data.heroSlides.length,3);assert.equal(page.data.waterfallItems.length,6);
 assert(page.data.waterfallItems.every(row=>row.preview&&row.demo));assert.equal(page.data.homeError,false);assert.equal(page.data.hasHomeLoaded,true);
});

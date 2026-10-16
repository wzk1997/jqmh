const test=require('node:test'), assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function load(file,mocks={}){const filename=path.join(root,file),mod={exports:{}};vm.runInThisContext('(function(require,module,exports){'+fs.readFileSync(filename,'utf8')+'\n})',{filename})(n=>n in mocks?mocks[n]:require(n.startsWith('.')?path.resolve(path.dirname(filename),n):n),mod,mod.exports);return mod.exports;}
const validation=load('cloudfunctions/mcloud/project/TRIP1/service/cms_validation.js');
function fixture({withCategories=true}={}){
 const stores={},queries=[],files=new Map();
 const models={};for(const kind of ['news','album','product','merchant','category','scenic','service']){const store=stores[kind]=new Map();const p=kind==='category'?'CONTENT_CATEGORY_':kind.toUpperCase()+'_';models[kind]={CL:'bx_'+kind,getOne:async q=>typeof q==='string'?store.get(q):[...store.values()].find(r=>Object.entries(q).every(([k,v])=>Array.isArray(v)?r[k]!==v[1]:r[k]===v)),insert:async d=>{store.set(d._id,{[p+'DELETED']:false,[p+'DRAFT']:{},[p+'ADD_TIME']:1,...d});return d._id},edit:async(id,d)=>Object.assign(store.get(id),structuredClone(d)),getList:async(...args)=>{queries.push({kind,args});return {list:[...store.values()],total:store.size}},getAll:async(q={})=>[...store.values()].filter(row=>Object.entries(q).every(([key,value])=>row[key]===value)),count:async()=>0};}
 // Explicit test records stand in for manually managed categories, not production defaults.
 if(withCategories)for(const module of ['news','album','product'])for(const key of ['1','2','3','4','5','tips']){
  const id='test-'+module+'-'+key;stores.category.set(id,{_id:id,CONTENT_CATEGORY_MODULE:module,CONTENT_CATEGORY_KEY:key,CONTENT_CATEGORY_NAME:key==='tips'?(module==='album'?'游玩贴士':'旅游资讯'):'测试分类'+key,CONTENT_CATEGORY_STATE:'published',CONTENT_CATEGORY_DELETED:false});
 }
 class Base{AppError(m){throw Error(m);}}
 const mocks={'./base_project_admin_service.js':Base,'../cms_validation.js':validation,'../../../../framework/database/db_util.js':{isExistCollection:async()=>true},'../../../../framework/utils/data_util.js':{dbForms2Obj:forms=>Object.fromEntries(forms.map(f=>[f.mark,f.val]))},'../../../../framework/validate/content_check.js':{checkTextMultiAdmin:async()=>{},checkImgAdmin:async()=>{}},'../../../../framework/utils/util.js':{getProjectId:()=> 'TRIP1'},'../../../../framework/cloud/cloud_base.js':{getCloud:()=>({downloadFile:async({fileID})=>({fileContent:files.get(fileID)||Buffer.from('bad')}),uploadFile:async({cloudPath,fileContent})=>{const fileID='cloud://env/'+cloudPath;files.set(fileID,fileContent);return {fileID}}})},'../../model/cms_asset_model.js':{CL:'bx_cms_asset',insert:async()=> 'asset'}};
 for(const [k,m]of Object.entries(models))mocks['../../model/'+(k==='category'?'content_category':k)+'_model.js']=m;
 const Cms=load('cloudfunctions/mcloud/project/TRIP1/service/admin/admin_cms_service.js',mocks);
 return {service:new Cms(),Cms,models,stores,queries,files};
}
test('legacy services persist staged drafts through existing signatures; invalid inputs do not create rows',async()=>{
 const f=fixture();const saved=await f.service.saveLegacy('news',{title:'景区动态标题',cateId:'1',order:10,desc:'欢迎游览',forms:[]});const row=f.stores.news.get(saved.id);assert.equal(row.NEWS_STATUS,0);assert.equal(row.NEWS_CMS_STATE,'draft');
 for(const input of [{title:' ',cateId:'1',order:10},{title:'标题',cateId:'unknown',order:10},{title:'标题',cateId:'1',order:-1}])await assert.rejects(f.service.saveLegacy('news',input));assert.equal(f.stores.news.size,1);
});
test('publish validates complete content; editing preserves the published version until explicit publication',async()=>{
 const f=fixture();const {id}=await f.service.saveLegacy('news',{title:'初版景区动态',cateId:'1',order:1,forms:[]});await assert.rejects(f.service.setState('news',id,'published'));
 const image='cloud://env/TRIP1/news/'+id+'/cover.jpg';f.files.set(image,Buffer.from([255,216,255,1]));
 await f.service.saveLegacy('news',{id,title:'初版景区动态',cateId:'1',order:1,forms:[],images:[image],content:[{type:'text',val:'初版正文'}]});await f.service.setState('news',id,'published','admin');
 await f.service.saveLegacy('news',{id,title:'编辑中的新标题',cateId:'1',order:2,forms:[],images:[image],content:[{type:'text',val:'未发布正文'}]});
 assert.equal(f.stores.news.get(id).NEWS_TITLE,'初版景区动态');assert.equal(f.stores.news.get(id).NEWS_STATUS,1);assert.equal((await f.service.detail('news',id)).NEWS_TITLE,'编辑中的新标题');
 await f.service.setState('news',id,'published','admin');assert.equal(f.stores.news.get(id).NEWS_TITLE,'编辑中的新标题');assert.deepEqual(f.stores.news.get(id).NEWS_DRAFT,{});
 await f.service.remove('news',id,'admin');assert.equal(f.stores.news.get(id).NEWS_STATUS,0);assert.equal(f.stores.news.get(id).NEWS_DELETED,true);await assert.rejects(f.service.detail('news',id));
});
test('merchant data, retired modules and attachment bytes are validated server-side',async()=>{
 const f=fixture();await assert.rejects(f.service.save('merchant',{name:'店铺',category:'payment',order:1},'admin'));await assert.rejects(f.service.save('panorama',{name:'场景',resourceType:'url',resource:'javascript:alert(1)',order:1},'admin'));assert.equal(f.stores.merchant.size,0);
 const {id}=await f.service.save('merchant',{name:'茶馆',category:'food',phone:'13800000000',address:'景区内',order:1},'admin');await assert.rejects(f.service.upload('merchant',id,Buffer.from('bad').toString('base64'),'admin'));const asset=await f.service.upload('merchant',id,Buffer.from([255,216,255,1]).toString('base64'),'admin');assert(asset.fileID.includes('/TRIP1/merchant/'+id+'/'));
 await assert.rejects(f.service.checkImages('merchant',id,['cloud://env/TRIP1/merchant/other/x.jpg']));
});
test('public queries exclude drafts and deleted resources and do not expose administrator fields',async()=>{
 const f=fixture();const publicService=load('cloudfunctions/mcloud/project/TRIP1/service/cms_service.js',{'./admin/admin_cms_service.js':f.Cms,'./cms_validation.js':validation});
 const {id}=await f.service.save('merchant',{name:'公开茶馆',category:'food',phone:'13800000000',address:'景区内',images:[],order:1},'admin');await assert.rejects(publicService.detail('merchant',id));
 const row=f.stores.merchant.get(id);row.MERCHANT_STATE='published';row.MERCHANT_DRAFT={MERCHANT_NAME:'秘密草稿'};
 const result=await publicService.detail('merchant',id);assert.equal(result.MERCHANT_NAME,'公开茶馆');assert(!('MERCHANT_EDIT_ADMIN'in result));assert(!('MERCHANT_DRAFT'in result));
 await publicService.list('merchant',{page:1});const where=f.queries.at(-1).args[0];assert.equal(where.and.MERCHANT_STATE,'published');assert.deepEqual(where.and.MERCHANT_DELETED,['<>',true]);
});
test('administrator permission gate rejects visitors and read-only writes before services execute',async()=>{
 let called=0;class Base{async isAdmin(){if(!this.admin)throw Error('登录');this._admin=this.admin;}requirePermission(module,op){if(!this.admin.permissions[module]?.includes(op))throw Error('权限');}logOther(){}}
 class Service{save(){called++;}list(){called++;return {list:[]};}}
 const Controller=load('cloudfunctions/mcloud/project/TRIP1/controller/admin/admin_cms_controller.js',{'./base_project_admin_controller.js':Base,'../../service/admin/admin_cms_service.js':Service,'../../service/cms_validation.js':validation});
 const c=new Controller();c._request={module:'merchant',data:{name:'注入'}};await assert.rejects(c.save(),/登录/);c.admin={permissions:{merchant:['read']}};await assert.rejects(c.save(),/权限/);assert.equal(called,0);await c.list();assert.equal(called,1);
});
test('linked spots and nested form fields are validated instead of trusting client metadata',async()=>{
 const f=fixture();await assert.rejects(f.service.saveLegacy('album',{title:'路线',cateId:'1',order:1,forms:[{mark:'spots',type:'select',val:['missing']}]}));assert.equal(f.stores.album.size,0);
 assert.throws(()=>validation.forms([{mark:'secret',type:'text',val:'注入'}],'album'));assert.throws(()=>validation.forms([{mark:'cover',type:'text',val:'bad'}],'album'));assert.throws(()=>validation.content([{type:'script',val:'bad'}]));
});
test('legacy public detail responses never include CMS drafts or editor identities',async()=>{
 for(const kind of ['news','album','product']){
  const p=kind.toUpperCase()+'_';const sourceRow={_id:'content',[p+'TITLE']:'公开标题',[p+'STATUS']:1,[p+'DRAFT']:{[p+'TITLE']:'内部草稿'},[p+'EDIT_ADMIN']:'admin-private'};
  const Service=load('cloudfunctions/mcloud/project/TRIP1/service/'+kind+'_service.js',{'./base_project_service.js':class {},'../../../framework/utils/util.js':{},['../model/'+kind+'_model.js']:{STATUS:{COMM:1},getOne:async()=>structuredClone(sourceRow),inc(){}}});
  const result=await new Service()['view'+kind[0].toUpperCase()+kind.slice(1)]('content');assert.equal(result[p+'TITLE'],'公开标题');assert(!Object.hasOwn(result,p+'DRAFT'));assert(!Object.hasOwn(result,p+'EDIT_ADMIN'));
 }
});
test('password verification retains existing accounts while newly saved passwords use salted scrypt',()=>{
 const util=require('../cloudfunctions/mcloud/project/TRIP1/service/admin/admin_password.js');const legacy=require('crypto').createHash('md5').update('existing-password').digest('hex');assert(util.verify('existing-password',legacy));assert(!util.verify('wrong',legacy));const hash=util.hash('secure-password');assert(hash.startsWith('scrypt$'));assert(util.verify('secure-password',hash));assert(!util.verify('wrong',hash));assert.notEqual(hash,util.hash('secure-password'));
});
test('real permission gate preserves legacy admins and denies unassigned operations',()=>{
 const Controller=load('cloudfunctions/mcloud/project/TRIP1/controller/admin/base_project_admin_controller.js',{'../../../../framework/platform/controller/base_admin_controller.js':class {},'../../service/base_project_service.js':class {}});
 const c=new Controller();assert.throws(()=>c.requirePermission('merchant','write'),/登录/);c._admin={ADMIN_TYPE:0,ADMIN_PERMISSIONS:{merchant:['read']}};c.requirePermission('merchant','read');assert.throws(()=>c.requirePermission('merchant','publish'),/权限/);assert.throws(()=>c.requirePermission('feedback','read'),/权限/);c._admin={ADMIN_TYPE:0};c.requirePermission('news','write');c._admin={ADMIN_TYPE:1,ADMIN_PERMISSIONS:{}};c.requirePermission('merchant','delete');
});
test('activity dates reject impossible calendar days and nested fields reject object injection',()=>{
 assert.equal(validation.date('2028-02-29'),'2028-02-29');assert.throws(()=>validation.date('2027-02-29'));assert.throws(()=>validation.date('2026-04-31'));assert.throws(()=>validation.forms([{mark:'desc',type:'textarea',val:{private:'data'}}],'album'));assert.throws(()=>validation.content(Array.from({length:30},()=>({type:'text',val:'长'.repeat(10000)}))));
});
test('category writes cannot use permissions from a different module',async()=>{
 let writes=0;class Base{async isAdmin(){this._admin={};}requirePermission(module){if(module!=='news')throw Error('权限');}logOther(){}}
 const Controller=load('cloudfunctions/mcloud/project/TRIP1/controller/admin/admin_cms_controller.js',{'./base_project_admin_controller.js':Base,'../../service/admin/admin_cms_service.js':class{save(){writes++;}},'../../service/cms_validation.js':validation});
 const c=new Controller();c._request={module:'category',categoryModule:'news',data:{module:'album',key:'injected',name:'绕过权限'}};await assert.rejects(c.save(),/分类模块不匹配/);assert.equal(writes,0);
});
function editorFixture(module){let definition;const calls=[],uploads=[],navigations=[];let failSecond=false;
 const cms={META:{[module]:{title:module}},confirm:async()=>true,call:async(action,params)=>{calls.push({action,params:structuredClone(params)});return {id:'draft-id'};},upload:async(kind,id,path)=>{uploads.push(path);if(failSecond&&path==='wxfile://two.jpg')throw Error('上传失败');return 'cloud://env/TRIP1/'+kind+'/'+id+'/'+path.split('/').at(-1);}};
 vm.runInNewContext(fs.readFileSync(path.join(root,'miniprogram/projects/TRIP1/pages/admin/cms/edit/cms_edit.js'),'utf8'),{require:n=>n.includes('cms_ui')?cms:{},Page:o=>definition=o,wx:{showToast(){},navigateBack(){navigations.push('back')}}});
 const page={...definition,data:structuredClone(definition.data),setData(patch){for(const[k,val]of Object.entries(patch)){const keys=k.split('.');let target=this.data;for(const part of keys.slice(0,-1))target=target[part];target[keys.at(-1)]=val;}},selectComponent(){return {getNodeList:()=>[{type:'text',val:'介绍正文'}]};}};page.data.module=module;page.data.form.name='示例内容';
 return {page,calls,uploads,navigations,failSecond(value){failSecond=value;}};
}
test('image upload retry reuses successful files and the existing draft without losing form input',async()=>{
 const f=editorFixture('merchant');f.page.data.images=['wxfile://one.jpg','wxfile://two.jpg'];f.failSecond(true);await f.page.save({currentTarget:{dataset:{}}});assert.equal(f.page.data.id,'draft-id');assert.equal(f.page.data.form.name,'示例内容');assert.equal(f.navigations.length,0);assert.equal(f.page.data.saving,false);
 f.failSecond(false);await f.page.save({currentTarget:{dataset:{}}});assert.deepEqual(f.uploads,['wxfile://one.jpg','wxfile://two.jpg','wxfile://two.jpg']);assert.equal(f.calls.filter(c=>c.action==='save'&&!c.params.data.id).length,1);assert.equal(f.navigations.length,1);
});
test('disabled default categories cannot reappear through compatibility defaults or be used to publish',async()=>{
 const f=fixture();const {id}=await f.service.saveLegacy('news',{title:'分类停用前的草稿',cateId:'1',order:1,forms:[]});
 f.stores.category.delete('test-news-1');f.stores.category.set('disabled',{_id:'disabled',CONTENT_CATEGORY_MODULE:'news',CONTENT_CATEGORY_KEY:'1',CONTENT_CATEGORY_NAME:'停用分类',CONTENT_CATEGORY_STATE:'offline',CONTENT_CATEGORY_DELETED:false});
 await assert.rejects(f.service.category('news','1'),/停用/);await assert.rejects(f.service.setState('news',id,'published'),/停用/);
 f.models.category.getAll=async()=>[...f.stores.category.values()].filter(row=>row.CONTENT_CATEGORY_MODULE==='news');const api=load('cloudfunctions/mcloud/project/TRIP1/service/cms_service.js',{'./admin/admin_cms_service.js':f.Cms,'./cms_validation.js':validation});const categories=await api.categories('news');assert(!categories.some(c=>c.id==='1'));
});
test('rapid CMS filter changes discard old responses instead of showing mismatched content',async()=>{
 let definition;const pending=[];vm.runInNewContext(fs.readFileSync(path.join(root,'miniprogram/projects/TRIP1/pages/admin/cms/list/cms_list.js'),'utf8'),{require:n=>n.includes('cms_ui')?{call:(action,params)=>new Promise(resolve=>pending.push({params,resolve})),normalize:(_,row)=>row}:{},Page:p=>definition=p});
 const page={...definition,data:structuredClone(definition.data),setData(p){Object.assign(this.data,p)}};page.data.module='merchant';const first=page.load();page.data.category='stay';const second=page.load();assert.equal(pending.length,2);pending[1].resolve({list:[{id:'hotel'}],total:1});await second;pending[0].resolve({list:[{id:'old-food'}],total:1});await first;assert.equal(page.data.records[0].id,'hotel');assert.equal(page.data.loading,false);
});
test('category management displays only stored categories and never synthesizes defaults',async()=>{
 let definition;const calls=[];vm.runInNewContext(fs.readFileSync(path.join(root,'miniprogram/projects/TRIP1/pages/admin/cms/list/cms_list.js'),'utf8'),{require:n=>n.includes('cms_ui')?{call:async(action,params)=>{calls.push({action,params});return action==='list'?{list:[{_id:'custom',CONTENT_CATEGORY_KEY:'custom',CONTENT_CATEGORY_NAME:'自定义',CONTENT_CATEGORY_STATE:'draft'}],total:1}:[{id:'activity',name:'景区活动',legacy:true},{id:'custom',name:'自定义'}];},normalize:(_,row)=>({id:row._id,key:row.CONTENT_CATEGORY_KEY,name:row.CONTENT_CATEGORY_NAME,state:row.CONTENT_CATEGORY_STATE,stateLabel:'草稿'}),META:{category:{title:'分类管理'}},can:()=>true}:{},Page:p=>definition=p});
 const page={...definition,data:structuredClone(definition.data),setData(p){Object.assign(this.data,p)}};page.data.module='category';page.data.categoryModule='news';await page.load();assert.equal(calls.length,1);assert.equal(calls[0].action,'list');assert.equal(page.data.records.length,1);assert.equal(page.data.records[0].name,'自定义');assert(!page.data.records[0].builtin);
});
test('compound database queries retain project isolation and status filters in the effective AND clause',()=>{
 const Multi=load('cloudfunctions/mcloud/framework/database/multi_model.js',{'./model.js':class {},'../utils/util.js':{getProjectId:()=> 'TRIP1'},'../utils/data_util.js':{},'../../config/config.js':{COLLECTION_PRFIX:'bx_'}});
 const result=Multi._getWhere({FEEDBACK_STATUS:0,_pid:'other-project',or:[{FEEDBACK_CONTENT:['like','设施']},{FEEDBACK_PHONE:['like','设施']}]});assert.equal(result.and._pid,'TRIP1');assert.equal(result.and.FEEDBACK_STATUS,0);assert.equal(result.or.length,2);assert(!Object.hasOwn(result,'_pid'));
 const nested=Multi._getWhere({and:{_pid:'other-project',NEWS_STATUS:1},or:[{NEWS_TITLE:['like','山']}]});assert.equal(nested.and._pid,'TRIP1');assert.equal(nested.and.NEWS_STATUS,1);
});
test('retired homepage recommendation read and clear routes are no longer registered',()=>{const routes=require('../cloudfunctions/mcloud/project/TRIP1/public/route.js');assert(!routes['home/list']);assert(!routes['admin/clear_vouch']);});
test('prepared database rules deny direct visitor SDK access to private and CMS collections',()=>{
 const rules=JSON.parse(fs.readFileSync(path.join(root,'cloudfunctions/mcloud/security/database-client-deny.json')));assert.equal(rules.read,false);assert.equal(rules.write,false);const manifest=JSON.parse(fs.readFileSync(path.join(root,'cloudfunctions/mcloud/security/collection-rules-manifest.json')));for(const collection of ['bx_admin','bx_feedback','bx_cms_asset','bx_news','bx_merchant','bx_panorama'])assert(manifest.collections.includes(collection));assert(['prepared-not-applied','partially-applied','applied'].includes(manifest.status));for(const collection of manifest.appliedCollections||[])assert(manifest.collections.includes(collection));
});
test('frontend permissions match server scope without granting absent modules',()=>{
 const ui=load('miniprogram/projects/TRIP1/ui/cms_ui.js',{'../../../helper/cloud_helper.js':{}});assert.equal(ui.can(null,'news','read'),false);assert.equal(ui.can({type:1},'news','delete'),true);assert.equal(ui.can({type:0,permissions:{}},'news','write'),true);const reader={type:0,permissions:{news:['read'],merchant:['read','write']}};assert.equal(ui.can(reader,'news','read'),true);assert.equal(ui.can(reader,'news','publish'),false);assert.equal(ui.can(reader,'merchant','write'),true);assert.equal(ui.can(reader,'feedback','read'),false);
});
test('CMS category filtering targets legacy cate IDs and merchant category fields correctly',async()=>{
 const f=fixture();await f.service.list('album',{category:'1'});assert.equal(f.queries.at(-1).args[0].and.ALBUM_CATE_ID,'1');assert(!Object.hasOwn(f.queries.at(-1).args[0].and,'ALBUM_CATEGORY'));await f.service.list('merchant',{category:'stay'});assert.equal(f.queries.at(-1).args[0].and.MERCHANT_CATEGORY,'stay');
});
test('published category name edits stay private until explicit publication',async()=>{
 const f=fixture();const {id}=await f.service.save('category',{module:'news',key:'custom',name:'原分类',order:1},'admin');await f.service.setState('category',id,'published');await f.service.save('category',{id,module:'news',key:'custom',name:'编辑中的分类',order:2},'admin');assert.equal(f.stores.category.get(id).CONTENT_CATEGORY_NAME,'原分类');assert.equal((await f.service.detail('category',id)).CONTENT_CATEGORY_NAME,'编辑中的分类');assert.equal(await f.service.category('news','custom'),'原分类');await f.service.setState('category',id,'published');assert.equal(await f.service.category('news','custom'),'编辑中的分类');
});
test('category keys remain immutable to preserve existing article and route references',async()=>{
 const f=fixture();const {id}=await f.service.save('category',{module:'album',key:'route-a',name:'路线',order:1},'admin');await assert.rejects(f.service.save('category',{id,module:'album',key:'route-b',name:'路线',order:1},'admin'),/分类编号/);assert.equal(f.stores.category.get(id).CONTENT_CATEGORY_KEY,'route-a');
});
test('real ORM saves CMS draft objects, typed defaults and immutable record IDs for all content models',async()=>{
 const base='cloudfunctions/mcloud/framework/';const util=require('../'+base+'utils/util.js'),dataUtil=require('../'+base+'utils/data_util.js'),timeUtil=require('../'+base+'utils/time_util.js');const saved=new Map();
 const Model=load(base+'database/model.js',{'./db_util.js':{insert:async(cl,row)=>{saved.set(cl,structuredClone(row));return row._id;},edit:async(cl,where,row)=>Object.assign(saved.get(cl),structuredClone(row))},'../utils/util.js':util,'../utils/time_util.js':timeUtil,'../utils/data_util.js':dataUtil,'../cloud/cloud_base.js':{getCloud:()=>({getWXContext:()=>({CLIENTIP:'test'})})}});
 const Multi=load(base+'database/multi_model.js',{'./model.js':Model,'../utils/util.js':{...util,getProjectId:()=> 'TRIP1'},'../utils/data_util.js':dataUtil,'../../config/config.js':{COLLECTION_PRFIX:'bx_'}});
 for(const kind of ['news','album','product','scenic','merchant','content_category']){
  const Content=load('cloudfunctions/mcloud/project/TRIP1/model/'+kind+'_model.js',{'./base_project_model.js':Multi});const p=kind.toUpperCase()+'_',id='a'.repeat(32);const row={_id:id,[p+(['news','album','product'].includes(kind)?'TITLE':'NAME')]:'真实模型标题'};if(kind==='news')Object.assign(row,{NEWS_CATE_ID:'1',NEWS_CATE_NAME:'动态'});const result=await Content.insert(row);assert.equal(result,id);assert.equal(saved.get(Content.CL)._pid,'TRIP1');assert.equal(saved.get(Content.CL)[p+'DELETED'],false);const draft={[p+'NAME']:'未发布内容',content:[{type:'text',val:'正文'}]};await Content.edit(id,{[p+'DRAFT']:draft});assert.deepEqual(saved.get(Content.CL)[p+'DRAFT'],draft);assert.equal(saved.get(Content.CL)._id,id);
 }
});
test('save-and-publish locks before confirmation to prevent duplicate draft creation',async()=>{
 const f=editorFixture('merchant');let confirm;f.page.data.images=[];const first=f.page.save({currentTarget:{dataset:{publish:true}}});const second=f.page.save({currentTarget:{dataset:{publish:true}}});await Promise.all([first,second]);assert.equal(f.calls.filter(c=>c.action==='save'&&!c.params.data.id).length,1);assert.equal(f.calls.filter(c=>c.action==='state').length,1);
});
test('feedback attachment uploads are owner bound and another visitor cannot attach them',async()=>{
 const assets=new Map(),feedback=new Map();let uploadCount=0;class Base{AppError(m){throw Error(m);}}
 const matches=(row,q)=>Object.entries(q).every(([k,v])=>row[k]===v);
 const Asset={CL:'bx_feedback_asset',getOne:async q=>[...assets.values()].find(row=>matches(row,q)),count:async q=>[...assets.values()].filter(row=>matches(row,q)).length,insert:async row=>assets.set(row._id,row)};
 const Service=load('cloudfunctions/mcloud/project/TRIP1/service/feedback_service.js',{'../../../framework/platform/service/base_service.js':Base,'../model/feedback_model.js':{CL:'bx_feedback',getOne:async q=>feedback.get(q._id),insert:async row=>feedback.set(row._id,row)},'../model/feedback_asset_model.js':Asset,'../../../framework/database/db_util.js':{isExistCollection:async()=>true},'../../../framework/utils/util.js':{getProjectId:()=> 'TRIP1'},'../../../framework/validate/content_check.js':{checkTextMultiClient:async()=>{},checkImgClient:async()=>{}},'../../../framework/cloud/cloud_base.js':{getCloud:()=>({uploadFile:async({cloudPath})=>{uploadCount++;return {fileID:'cloud://env/'+cloudPath}},downloadFile:async()=>({fileContent:Buffer.from([255,216,255,1])})})}});
 const service=new Service(),requestId='request_1234567890',base64=Buffer.from([255,216,255,1]).toString('base64');const first=await service.upload('visitor-a',{requestId,base64});const retry=await service.upload('visitor-a',{requestId,base64});assert.equal(first.fileID,retry.fileID);assert.equal(uploadCount,1);
 const input={category:'其他反馈',content:'测试附件所有权',phone:'',requestId,images:[first.fileID]};await assert.rejects(service.submit('visitor-b',input),/不属于/);assert.equal(feedback.size,0);await service.submit('visitor-a',input);assert.equal(feedback.size,1);
});
test('prepared storage rules prevent direct feedback writes while preserving content and owner access',()=>{
 const rules=JSON.parse(fs.readFileSync(path.join(root,'cloudfunctions/mcloud/security/storage-rules.json')));const evaluate=(expression,resource,auth)=>vm.runInNewContext(expression,{resource,auth});assert.equal(evaluate(rules.write,{path:'TRIP1/feedback/request/file.jpg',openid:'owner'},{openid:'owner'}),false);assert.equal(evaluate(rules.read,{path:'TRIP1/feedback/request/file.jpg',openid:'owner'},{openid:'other'}),false);assert.equal(evaluate(rules.read,{path:'TRIP1/feedback/request/file.jpg',openid:'owner'},{openid:'owner'}),true);assert.equal(evaluate(rules.read,{path:'TRIP1/merchant/id/image.jpg',openid:''},null),true);assert.equal(evaluate(rules.write,{path:'TRIP1/user/id/avatar.jpg',openid:'owner'},{openid:'owner'}),true);
});
test('guide detail API resolves only published route stops without increasing attraction view counts',async()=>{
 const queries=[],increments=[];const row={_id:'guide',ALBUM_TITLE:'路线',ALBUM_OBJ:{spots:['live','offline']},ALBUM_ROUTE:[{spotId:'live',duration:'约1小时',note:'观景'}]};
 const Service=load('cloudfunctions/mcloud/project/TRIP1/service/album_service.js',{'./base_project_service.js':class {},'../../../framework/utils/util.js':{},'../model/album_model.js':{STATUS:{COMM:1},getOne:async()=>structuredClone(row),inc:(...args)=>increments.push(args)},'../model/product_model.js':{getOne:async q=>{queries.push(q);return q._id==='live'?{_id:'live',PRODUCT_TITLE:'观景台',PRODUCT_OBJ:{cover:['/actual.jpg']}}:null;},inc(){throw Error('must not inflate attraction views');}}});
 const result=await new Service().viewAlbum('guide');assert.equal(result.ALBUM_SPOTS.length,1);assert.equal(result.ALBUM_SPOTS[0].duration,'约1小时');assert.equal(result.ALBUM_SPOTS[0].note,'观景');assert(queries.every(q=>q.PRODUCT_STATUS===1&&q.PRODUCT_DELETED[0]==='<>'));assert.equal(increments.length,1);assert.equal(increments[0][1],'ALBUM_VIEW_CNT');
});
test('guide itinerary requires linked real attractions and validates durations on the server',async()=>{
 const f=fixture();f.stores.product.set('spot',{_id:'spot',PRODUCT_TITLE:'景点',PRODUCT_STATUS:1,PRODUCT_CMS_STATE:'published'});const base={title:'真实路线',cateId:'1',order:1,forms:[{mark:'spots',type:'select',val:['spot']}],duration:'约3小时',route:[{spotId:'spot',duration:'约1小时',note:'欣赏湖景'}]};const {id}=await f.service.saveLegacy('album',base);assert.equal(f.stores.album.get(id).ALBUM_DURATION,'约3小时');assert.equal(f.stores.album.get(id).ALBUM_ROUTE[0].note,'欣赏湖景');await assert.rejects(f.service.saveLegacy('album',{...base,route:[{spotId:'missing',duration:'1小时'}]}));await assert.rejects(f.service.saveLegacy('album',{...base,route:[base.route[0],base.route[0]]}));
});

test('scenic metadata validates cards, media and complete coordinates while dropping removed settings',()=>{
 const validate=require('../cloudfunctions/mcloud/project/TRIP1/service/scenic_info_validation.js');
 const info=validate({tagline:' 山水相拥 ',highlights:[{title:'云海',desc:'自然景观',imageIndex:1}],latitude:'0',longitude:'120',video:'https://media.example.com/scenic.mp4',closingQuote:'美好出发',privateField:'discard'},['/photo.jpg']);
 assert.equal(info.tagline,'山水相拥');assert.equal(info.latitude,0);assert.equal(info.highlights[0].imageIndex,1);assert(!Object.hasOwn(info,'privateField'));
 const legacy=validate({reasons:[{title:'理由'}],nature:[{title:'自然景观'}],culture:[{title:'人文故事'}],galleryTags:['风景'],services:'游客服务',centerService:'游客中心',toiletService:'卫生间',restService:'休息区',foodService:'餐饮服务',coverQuote:'封面寄语',coverDescription:'说明',overviewQuote:'概况寄语',highlightsQuote:'亮点寄语',galleryQuote:'相册寄语',closingQuote:'底部寄语'},[]);for(const key of ['reasons','nature','culture','galleryTags','services','centerService','toiletService','restService','foodService','coverQuote','coverDescription','overviewQuote','highlightsQuote','galleryQuote','closingQuote'])assert(!Object.hasOwn(legacy,key));
 for(const input of [{highlights:[{title:'景点',imageIndex:2}]},{video:'javascript:bad'},{latitude:'91',longitude:'120'},{latitude:'0',longitude:''},{tips:{private:'data'}}])assert.throws(()=>validate(input,['/photo.jpg']));
});
test('scenic edits keep published metadata private, preserve omitted fields and promote explicit drafts',async()=>{
 const f=fixture();const {id}=await f.service.save('scenic',{name:'WeTravel',order:1,images:[],content:[],info:{tagline:'初版',highlights:[]}},'admin');
 const image='cloud://env/TRIP1/scenic/'+id+'/cover.jpg';f.files.set(image,Buffer.from([255,216,255,1]));
 const data={id,name:'WeTravel',order:1,images:[image],content:[{type:'text',val:'景区介绍'}],info:{tagline:'初版',highlights:[{title:'森林',desc:'真实介绍',imageIndex:1}]}};
 await f.service.save('scenic',data,'admin');await f.service.setState('scenic',id,'published','admin');
 await f.service.save('scenic',{...data,info:{...data.info,tagline:'草稿副标题'}},'admin');
 const api=load('cloudfunctions/mcloud/project/TRIP1/service/cms_service.js',{'./admin/admin_cms_service.js':f.Cms,'./cms_validation.js':validation});
 assert.equal((await api.detail('scenic',id)).SCENIC_INFO.tagline,'初版');assert.equal((await f.service.detail('scenic',id)).SCENIC_INFO.tagline,'草稿副标题');
 const oldClient={...data};delete oldClient.info;await f.service.save('scenic',oldClient,'admin');assert.equal((await f.service.detail('scenic',id)).SCENIC_INFO.tagline,'草稿副标题');
 await f.service.setState('scenic',id,'published','admin');const published=await api.detail('scenic',id);assert.equal(published.SCENIC_INFO.tagline,'草稿副标题');assert(!Object.hasOwn(published,'SCENIC_DRAFT'));
 await f.service.save('scenic',{...oldClient,images:[]},'admin');await assert.rejects(f.service.setState('scenic',id,'published'),/图片序号|完善/);
});

test('CMS route picker returns published attraction metadata without calling visitor view or exposing drafts',async()=>{
 const f=fixture(),queries=[];f.models.product.getList=async(where,fields,order,page,size)=>{queries.push({where,fields,page,size});return {list:[{_id:'live',PRODUCT_TITLE:'真实景点',PRODUCT_OBJ:{cover:['/real.jpg']},PRODUCT_DRAFT:{PRODUCT_TITLE:'秘密草稿'}}],total:60};};f.models.product.getOne=async where=>where._id==='live'?{_id:'live',PRODUCT_TITLE:'真实景点',PRODUCT_OBJ:{cover:['/real.jpg']}}:null;
 const result=await f.service.spots({page:2,size:50,ids:['live','offline']});assert.equal(queries[0].where.PRODUCT_STATUS,1);assert.deepEqual(queries[0].where.PRODUCT_DELETED,['<>',true]);assert.equal(queries[0].page,2);assert.equal(result.list[0].name,'真实景点');assert(!Object.hasOwn(result.list[0],'PRODUCT_DRAFT'));assert.equal(result.selected[1].available,false);assert.equal(result.selected[1].id,'offline');await assert.rejects(f.service.spots({ids:['invalid / id']}));await assert.rejects(f.service.spots({size:51}));
});
test('route picker requires a logged in administrator with album read permission',async()=>{
 let calls=0;class Base{async isAdmin(){if(!this.admin)throw Error('登录');this._admin=this.admin;}requirePermission(module,op){if(!this.admin[module]?.includes(op))throw Error('权限');}}
 const Controller=load('cloudfunctions/mcloud/project/TRIP1/controller/admin/admin_cms_controller.js',{'./base_project_admin_controller.js':Base,'../../service/admin/admin_cms_service.js':class {async spots(){calls++;return {list:[]};}},'../../service/cms_validation.js':validation});const c=new Controller();c._request={module:'album'};await assert.rejects(c.spots(),/登录/);c.admin={news:['read']};await assert.rejects(c.spots(),/权限/);assert.equal(calls,0);c.admin={album:['read']};await c.spots();assert.equal(calls,1);
});
test('route editing retains selected attractions beyond page one and saves an explicitly reordered itinerary',async()=>{
 const f=editorFixture('album');f.page.data.categories=[{id:'1',name:'线路'}];f.page.data.selectedSpots=['outside','first'];f.page.data.spots=[{id:'first',name:'起点',available:true},{id:'outside',name:'后续景点',available:true}];f.page.data.routePlan=[{spotId:'outside',duration:'2小时',note:'森林漫步'},{spotId:'first',duration:'1小时',note:''}];f.page.syncRouteOrder();f.page.moveSpot({currentTarget:{dataset:{index:0,delta:1}}});assert.deepEqual(f.page.data.selectedSpots,['first','outside']);const input=f.page.build([],[]);assert.deepEqual(input.route.map(n=>n.spotId),['first','outside']);assert.equal(input.route[1].duration,'2小时');assert.deepEqual(input.forms.find(n=>n.mark==='spots').val,['first','outside']);
});

test('demo reservation uses fixed independent records and never overwrites existing or removed content',async()=>{
 const f=fixture();const reserved=await f.service.reserveDemo('album_classic','admin');assert.equal(reserved.id,'wt_demo_album_classic');const row=f.stores.album.get(reserved.id);assert.equal(row.ALBUM_STATUS,0);assert.equal(row.ALBUM_DEMO,true);row.ALBUM_TITLE='管理员已经编辑的标题';row.ALBUM_DELETED=true;const again=await f.service.reserveDemo('album_classic','admin');assert.equal(again.created,false);assert.equal(row.ALBUM_TITLE,'管理员已经编辑的标题');assert.equal(row.ALBUM_DELETED,true);await assert.rejects(f.service.reserveDemo('unknown','admin'));
});
test('demo creation is gated by super administrator authentication before any database write',async()=>{
 let calls=0;class Base{async isSuperAdmin(){if(!this.super)throw Error('超级管理员');this._adminId='admin';}requirePermission(){}async logOther(){}}
 const Controller=load('cloudfunctions/mcloud/project/TRIP1/controller/admin/admin_cms_controller.js',{'./base_project_admin_controller.js':Base,'../../service/admin/admin_cms_service.js':class{reserveDemo(){calls++;return {id:'demo'};}},'../../service/cms_validation.js':validation});const c=new Controller();c._request={key:'album_classic'};await assert.rejects(c.reserveDemo(),/超级管理员/);assert.equal(calls,0);c.super=true;await c.reserveDemo();assert.equal(calls,1);
});

test('public guide sorting restores semantic priority after cloud transport reorders object keys',async()=>{
 let order;const Service=load('cloudfunctions/mcloud/project/TRIP1/service/album_service.js',{'./base_project_service.js':class{getProjectId(){return 'TRIP1';}},'../../../framework/utils/util.js':{isDefined:v=>v!==undefined},'../model/album_model.js':{STATUS:{COMM:1},count:async()=>0,getList:async(_,__,o)=>{order=o;return {list:[]};}}});await new Service().getAlbumList({orderBy:{ALBUM_ADD_TIME:'desc',ALBUM_ORDER:'asc'}});assert.deepEqual(Object.keys(order),['ALBUM_ORDER','ALBUM_ADD_TIME']);await new Service().getAlbumList({orderBy:{ALBUM_ADD_TIME:'desc',ALBUM_VIEW_CNT:'desc'}});assert.deepEqual(Object.keys(order),['ALBUM_VIEW_CNT','ALBUM_ADD_TIME']);await assert.rejects(new Service().getAlbumList({orderBy:{private:'asc'}}));
});

test('keyword searches retain route categories and treat regex punctuation as literal text',async()=>{
 const util=require('../cloudfunctions/mcloud/framework/utils/util.js');assert.equal(util.escapeRegex('观景(台)+[1]'),'观景\\(台\\)\\+\\[1\\]');
 let where;const Service=load('cloudfunctions/mcloud/project/TRIP1/service/album_service.js',{'./base_project_service.js':class{getProjectId(){return 'TRIP1';}},'../../../framework/utils/util.js':util,'../model/album_model.js':{STATUS:{COMM:1},count:async()=>0,getList:async w=>{where=w;return {list:[]};}}});await new Service().getAlbumList({search:'山水',sortType:'cateId',sortVal:'1'});assert.equal(where.and.ALBUM_CATE_ID,'1');assert(where.or.some(clause=>clause['ALBUM_OBJ.desc']));
});
test('prepared storage rules use documented expressions without unsupported regex groups or negation',()=>{
 const rules=JSON.parse(fs.readFileSync(path.join(root,'cloudfunctions/mcloud/security/storage-rules.json')));
 for(const expression of Object.values(rules)){assert(!/!\s*\//.test(expression));const patterns=[...expression.matchAll(/\/((?:\\.|[^/\\])*)\//g)];assert(patterns.length>0);for(const match of patterns)assert(!/[()]/.test(match[1]));}
 const evaluate=(expression,resource,auth)=>vm.runInNewContext(expression,{resource,auth});
 assert.equal(evaluate(rules.write,{path:'TRIP1/feedback/request/file.jpg',openid:'owner'},{uid:'owner'}),false);
 assert.equal(evaluate(rules.write,{path:'TRIP1/user/id/avatar.jpg',openid:'owner'},{uid:'owner'}),true);
 assert.equal(evaluate(rules.read,{path:'TRIP1/scenic/id/cover.jpg',openid:''},null),true);
 assert.equal(evaluate(rules.write,{path:'unknown/file.jpg',openid:'owner'},{openid:'owner'}),false);
});

 test('CMS explicitly replaces draft and nested content through schema validation and scoped ORM updates',async()=>{
 const base='cloudfunctions/mcloud/framework/',util=require('../'+base+'utils/util.js'),dataUtil=require('../'+base+'utils/data_util.js'),timeUtil=require('../'+base+'utils/time_util.js');const calls=[];
 const Model=load(base+'database/model.js',{'./db_util.js':{getCmd:()=>({set:value=>({replacement:value})}),edit:async(cl,where,data)=>calls.push({cl,where,data})},'../utils/util.js':util,'../utils/time_util.js':timeUtil,'../utils/data_util.js':dataUtil,'../cloud/cloud_base.js':{getCloud:()=>({getWXContext:()=>({CLIENTIP:'test'})})}});
 const Multi=load(base+'database/multi_model.js',{'./model.js':Model,'../utils/util.js':{...util,getProjectId:()=> 'TRIP1'},'../utils/data_util.js':dataUtil,'../../config/config.js':{COLLECTION_PRFIX:'bx_'}});
 const News=load('cloudfunctions/mcloud/project/TRIP1/model/news_model.js',{'./base_project_model.js':Multi});
 await assert.rejects(News.edit('record',{injected:'reject'},true,['injected']));
 await News.edit('record',{NEWS_DRAFT:{},NEWS_OBJ:{desc:'current'}},true,['NEWS_DRAFT','NEWS_OBJ']);
 assert.deepEqual(calls[0].where,{_id:'record',_pid:'TRIP1'});assert.deepEqual(calls[0].data.NEWS_DRAFT,{replacement:{}});assert.deepEqual(calls[0].data.NEWS_OBJ,{replacement:{desc:'current'}});assert(!Object.hasOwn(calls[0].data,'injected'));
 await News.edit('record',{NEWS_OBJ:{desc:'legacy'}});assert.deepEqual(calls[1].data.NEWS_OBJ,{desc:'legacy'});
 const f=fixture();let replacementFields;const edit=f.models.news.edit;f.models.news.edit=async(id,data,mustPID,fields)=>{replacementFields=fields;return edit(id,data);};
 f.stores.news.set('record',{});await f.service.replaceContent(f.models.news,'record',{NEWS_DRAFT:{},NEWS_TITLE:'title'});assert.deepEqual(replacementFields,['NEWS_DRAFT']);
 });

test('latest guides use publication time with legacy fallback before server pagination and keep public scope',async()=>{
 const calls=[];const aggregate={ifNull:x=>({op:'ifNull',x}),gt:x=>({op:'gt',x}),cond:x=>({op:'cond',x})};const evalValue=(value,row)=>{if(typeof value==='string'&&value.startsWith('$'))return row[value.slice(1)];if(!value?.op)return value;if(value.op==='ifNull')return evalValue(value.x[0],row)??value.x[1];if(value.op==='gt')return evalValue(value.x[0],row)>value.x[1];return evalValue(value.x.if,row)?evalValue(value.x.then,row):evalValue(value.x.else,row);};
 const Service=load('cloudfunctions/mcloud/project/TRIP1/service/album_service.js',{'./base_project_service.js':class{getProjectId(){return 'TRIP1';}},'../../../framework/utils/util.js':{isDefined:v=>v!==undefined},'../model/album_model.js':{CL:'bx_album',STATUS:{COMM:1},getList(){throw Error('latest must compute before paging');}},'../../../framework/database/db_util.js':{getCmd:()=>({aggregate}),getListComputed:async(...args)=>{calls.push(args);return {list:[]};}}});
 await new Service().getAlbumList({sortMode:'latest',sortType:'cateId',sortVal:'1',page:2,size:20});const [cl,where,fields,computed,sort,page,size]=calls[0];assert.equal(cl,'bx_album');assert.equal(where.and._pid,'TRIP1');assert.equal(where.and.ALBUM_STATUS,1);assert.equal(where.and.ALBUM_CATE_ID,'1');assert.deepEqual(where.and.ALBUM_DELETED,['<>',true]);assert.equal(page,2);assert.equal(size,20);assert.deepEqual(Object.keys(sort),['__publishSort','_id']);assert(fields.includes('ALBUM_PUBLISH_TIME'));assert(!fields.includes('DRAFT'));
 assert.equal(evalValue(computed.__publishSort,{ALBUM_ADD_TIME:100,ALBUM_PUBLISH_TIME:300}),300);assert.equal(evalValue(computed.__publishSort,{ALBUM_ADD_TIME:200,ALBUM_PUBLISH_TIME:0}),200);assert.equal(evalValue(computed.__publishSort,{ALBUM_ADD_TIME:200}),200);await assert.rejects(new Service().getAlbumList({sortMode:'injected'}));await assert.rejects(new Service().getAlbumList({sortMode:'latest',page:-1}));
});

test('rich text accepts bounded paragraph formats and rejects CSS, HTML and malformed format payloads',()=>{
 const formatted=validation.content([{type:'text',val:'段落内容',format:{bold:true,italic:false,underline:true,align:'center'}}]);assert.deepEqual(JSON.parse(JSON.stringify(formatted[0].format)),{bold:true,italic:false,underline:true,align:'center'});assert.deepEqual(Object.keys(validation.content([{type:'text',val:'原有正文'}])[0]),['type','val']);
 for(const format of [{bold:'true'},{color:'red'},{align:'justify'},[],null,{html:'<script>'}])assert.throws(()=>validation.content([{type:'text',val:'正文',format}]));assert.throws(()=>validation.content([{type:'img',val:'cloud://env/file',format:{bold:true}}]));
});

test('retired panorama CMS operations reject before touching content storage',async()=>{
 const f=fixture();
 for(const [method,args] of [
  ['list',['panorama',{}]],['detail',['panorama','legacy']],
  ['save',['panorama',{name:'旧全景',order:1},'admin']],
  ['setState',['panorama','legacy','published']],['remove',['panorama','legacy']],
  ['sort',['panorama','legacy',1]],['upload',['panorama','legacy','AAAA','admin']]
 ])await assert.rejects(f.service[method](...args),/模块不正确/);
 const api=load('cloudfunctions/mcloud/project/TRIP1/service/cms_service.js',{'./admin/admin_cms_service.js':f.Cms,'./cms_validation.js':validation});
 await assert.rejects(api.list('panorama',{}),/公开模块不正确/);
 await assert.rejects(api.detail('panorama','legacy'),/公开模块不正确/);
 assert.equal(f.queries.length,0);assert.equal(f.files.size,0);
 assert(!require('../cloudfunctions/mcloud/project/TRIP1/public/cms_demo_data.js').some(row=>row.module==='panorama'));
});

test('guide first page starts count and list together and selects only card fields',async()=>{
 const calls=[];let finishCount,finishList;
 const Model={STATUS:{COMM:1},count:where=>{calls.push({kind:'count',where});return new Promise(r=>finishCount=r);},getList:(...args)=>{calls.push({kind:'list',args});return new Promise(r=>finishList=r);}};
 const Service=load('cloudfunctions/mcloud/project/TRIP1/service/album_service.js',{'./base_project_service.js':class{getProjectId(){return 'TRIP1';}},'../../../framework/utils/util.js':{isDefined:v=>v!==undefined},'../model/album_model.js':Model});
 const pending=new Service().getAlbumList({page:1,size:20,sortType:'cateId',sortVal:'1'});
 assert.deepEqual(calls.map(c=>c.kind),['count','list']);
 const [,fields,,,size,isTotal]=calls[1].args;assert.equal(size,20);assert.equal(isTotal,false);
 assert(fields.split(',').includes('ALBUM_OBJ.cover'));assert(fields.split(',').includes('ALBUM_OBJ.desc'));assert(fields.split(',').includes('ALBUM_OBJ.spots'));
 for(const excluded of ['ALBUM_OBJ','ALBUM_ROUTE','ALBUM_OBJ.detail','ALBUM_DRAFT'])assert(!fields.split(',').includes(excluded));
 assert.deepEqual(calls[0].where,calls[1].args[0]);assert.equal(calls[0].where.and.ALBUM_STATUS,1);assert.equal(calls[0].where.and._pid,'TRIP1');
 finishList({page:1,size:20,list:[{_id:'card'}]});finishCount(41);
 const result=await pending;assert.equal(result.total,41);assert.equal(result.count,3);assert.equal(result.list[0]._id,'card');
 // Later pages still use the existing oldTotal offset calculation, without an extra count.
 Model.count=()=>assert.fail('must use pagination count path');let args;Model.getList=async(...v)=>{args=v;return {list:[],total:41}};
 await new Service().getAlbumList({page:2,size:20,oldTotal:40});assert.equal(args[5],true);assert.equal(args[6],40);
 await new Service().getAlbumList({page:1,size:20,isTotal:false});assert.equal(args[5],false);
});

test('latest guide first page also runs its count alongside the computed publication query',async()=>{
 const started=[];let resolveCount,resolveList;
 const Model={CL:'bx_album',STATUS:{COMM:1},count:()=>{started.push('count');return new Promise(r=>resolveCount=r);}};
 const aggregate={ifNull:x=>x,gt:x=>x,cond:x=>x};
 const Service=load('cloudfunctions/mcloud/project/TRIP1/service/album_service.js',{'./base_project_service.js':class{getProjectId(){return 'TRIP1';}},'../../../framework/utils/util.js':{isDefined:v=>v!==undefined},'../model/album_model.js':Model,'../../../framework/database/db_util.js':{getCmd:()=>({aggregate}),getListComputed:(...args)=>{started.push('list');assert.equal(args[7],false);assert(!args[2].split(',').includes('ALBUM_OBJ'));return new Promise(r=>resolveList=r);}}});
 const pending=new Service().getAlbumList({sortMode:'latest',page:1,size:20});assert.deepEqual(started,['count','list']);resolveCount(0);resolveList({page:1,size:20,list:[]});assert.equal((await pending).count,0);
});

test('guide tips and news tips keep independent categories and records',async()=>{
 const f=fixture();
 assert.equal(await f.service.category('album','tips'),'游玩贴士');
 assert.equal(await f.service.category('news','tips'),'旅游资讯');
 const guide=await f.service.saveLegacy('album',{title:'同名内容',cateId:'tips',order:1,forms:[]});
 const news=await f.service.saveLegacy('news',{title:'同名内容',cateId:'tips',order:1,forms:[]});
 assert.equal(f.stores.album.size,1);assert.equal(f.stores.news.size,1);
 assert.equal(f.stores.album.get(guide.id).ALBUM_CATE_NAME,'游玩贴士');
 assert(!Object.keys(f.stores.album.get(guide.id)).some(k=>k.startsWith('NEWS_')));
 assert(!Object.keys(f.stores.news.get(news.id)).some(k=>k.startsWith('ALBUM_')));
 await f.service.remove('news',news.id);
 assert.equal((await f.service.detail('album',guide.id)).ALBUM_TITLE,'同名内容');
 const api=load('cloudfunctions/mcloud/project/TRIP1/service/cms_service.js',{'./admin/admin_cms_service.js':f.Cms,'./cms_validation.js':validation});
 assert((await api.categories('album')).some(row=>row.id==='tips'&&row.name==='游玩贴士'));
});

test('empty category storage stays empty and content cannot silently recreate a default category',async()=>{
 const f=fixture({withCategories:false}),api=load('cloudfunctions/mcloud/project/TRIP1/service/cms_service.js',{'./admin/admin_cms_service.js':f.Cms,'./cms_validation.js':validation});
 for(const module of ['news','album','product']){assert.deepEqual(await api.categories(module),[]);await assert.rejects(f.service.category(module,'1'),/不存在/);}
 assert.equal(f.stores.category.size,0);
});

test('category deletion blocks current or pending draft references, then stays deleted within its module',async()=>{
 const f=fixture();let where;f.models.product.count=async q=>{where=q;return 1;};
 await assert.rejects(f.service.remove('category','test-product-1'),/草稿使用/);
 assert.equal(where.and.PRODUCT_DELETED[0],'<>');assert(where.or.some(q=>q['PRODUCT_DRAFT.PRODUCT_CATE_ID']==='1'));assert(where.or.some(q=>q.PRODUCT_CATE_ID==='1'));
 assert.equal(f.stores.category.get('test-product-1').CONTENT_CATEGORY_DELETED,false);
 f.models.product.count=async()=>0;await f.service.remove('category','test-product-1');
 const api=load('cloudfunctions/mcloud/project/TRIP1/service/cms_service.js',{'./admin/admin_cms_service.js':f.Cms,'./cms_validation.js':validation});
 assert(!(await api.categories('product')).some(row=>row.id==='1'));await assert.rejects(f.service.category('product','1'),/停用/);
 assert((await api.categories('news')).some(row=>row.id==='1'));
});

test('fresh setup creates required collections and administrator but no sample business records',async()=>{
 const collections=new Set(),admins=[];const Service=load('cloudfunctions/mcloud/project/TRIP1/service/base_project_service.js',{
  '../../../framework/database/db_util.js':{isExistCollection:async name=>collections.has(name),createCollection:async name=>collections.add(name)},
  '../../../framework/utils/util.js':{getProjectId:()=> 'TRIP1'},
  '../../../framework/platform/model/admin_model.js':{count:async()=>admins.length,insert:async row=>admins.push(row)},
  '../../../framework/platform/service/base_service.js':class {}
 });
 await new Service().initSetup();assert.equal(admins.length,1);assert(collections.has('bx_setup_trip1'));assert(collections.has('bx_album'));
 await new Service().initSetup();assert.equal(admins.length,1);
 const settings=require('../miniprogram/projects/TRIP1/public/project_setting.js');
 for(const key of ['NEWS_CATE','ALBUM_CATE','PRODUCT_CATE'])assert.deepEqual(settings[key],[]);
});

test('category list deletion confirms, uses the correct scope, refreshes and enforces the UI permission gate',async()=>{
 let definition,confirmed=true,confirmCalls=0;const calls=[];
 const cms={confirm:async()=>{confirmCalls++;return confirmed;},call:async(action,params)=>{calls.push({action,params});return {list:[],total:0}},normalize:(_,r)=>r};
 vm.runInNewContext(fs.readFileSync(path.join(root,'miniprogram/projects/TRIP1/pages/admin/cms/list/cms_list.js'),'utf8'),{Page:o=>definition=o,require:n=>n.includes('cms_ui')?cms:{},wx:{showToast(){}}});
 const p={...definition,data:structuredClone(definition.data),setData(v){Object.assign(this.data,v)}};
 Object.assign(p.data,{module:'category',categoryModule:'product',canDelete:true,records:[{id:'category-id',name:'手动分类'}]});
 const event={currentTarget:{dataset:{id:'category-id'}}};confirmed=false;await p.removeCategory(event);assert.equal(calls.length,0);assert.equal(p.data.deleting,false);
 p.data.canDelete=false;await p.removeCategory(event);assert.equal(confirmCalls,1);
 p.data.canDelete=true;confirmed=true;await p.removeCategory(event);assert.equal(calls[0].action,'remove');assert.deepEqual(JSON.parse(JSON.stringify(calls[0].params)),{module:'category',id:'category-id',categoryModule:'product'});assert.equal(calls[1].action,'list');assert.equal(p.data.records.length,0);assert.equal(p.data.deleting,false);
});

test('independent carousel asset upload validates bytes and stores assets outside scenic records',async()=>{
 const f=fixture();const result=await f.service.uploadAsset('home_portal','SETUP_HOME_PORTAL',Buffer.from([255,216,255,1]).toString('base64'),'admin');
 assert(result.fileID.includes('/TRIP1/home_portal/SETUP_HOME_PORTAL/'));assert.equal(f.stores.scenic.size,0);
 await assert.rejects(f.service.uploadAsset('home_portal','SETUP_HOME_PORTAL',Buffer.from('invalid').toString('base64'),'admin'),/JPG/);
});

test('convenience service records have isolated storage, staged publication and soft deletion',async()=>{
 const f=fixture();const data={name:'停车指引',desc:'停车位置说明',order:2,content:[{type:'text',val:'请按园区标识停车'}]};
 const {id}=await f.service.save('service',data,'admin');
 await f.service.setState('service',id,'published','admin');
 await f.service.save('service',{...data,id,name:'新停车指引'},'admin');
 assert.equal(f.stores.service.get(id).SERVICE_NAME,'停车指引');
 assert.equal((await f.service.detail('service',id)).SERVICE_NAME,'新停车指引');
 for(const kind of ['scenic','merchant','news','album'])assert.equal(f.stores[kind].size,0);
 const publicApi=load('cloudfunctions/mcloud/project/TRIP1/service/cms_service.js',{'./admin/admin_cms_service.js':f.Cms,'./cms_validation.js':validation});
 const published=await publicApi.detail('service',id);
 assert.equal(published.SERVICE_NAME,'停车指引');assert(!('SERVICE_DRAFT' in published));assert(!('SERVICE_EDIT_ADMIN' in published));
 await f.service.setState('service',id,'published','admin');
 assert.equal((await publicApi.detail('service',id)).SERVICE_NAME,'新停车指引');
 await f.service.remove('service',id,'admin');
 assert.equal(f.stores.service.get(id).SERVICE_DELETED,true);
 await assert.rejects(publicApi.detail('service',id),/尚未发布/);
});

test('convenience services cannot publish empty content and use independent permission scope',async()=>{
 const f=fixture();const {id}=await f.service.save('service',{name:'营业时间',order:1},'admin');
 await assert.rejects(f.service.setState('service',id,'published','admin'),/正文/);
 const gates=[];
 class Controller{async isAdmin(){}requirePermission(module,op){gates.push([module,op]);throw Error('denied');}}
 const Admin=load('cloudfunctions/mcloud/project/TRIP1/controller/admin/admin_cms_controller.js',{'./base_project_admin_controller.js':Controller,'../../service/admin/admin_cms_service.js':f.Cms,'../../service/cms_validation.js':validation});
 for(const [method,op]of [['list','read'],['save','write'],['state','publish'],['remove','delete']]){
  const c=new Admin();c._request={module:'service',id};await assert.rejects(c[method](),/denied/);assert.deepEqual(gates.at(-1),['service',op]);
 }
});

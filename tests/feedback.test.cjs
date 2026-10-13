const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
function load(file, mocks) {
    const module = { exports: {} };
    const wrapper = vm.runInThisContext('(function(require,module,exports){' + fs.readFileSync(path.join(root, file), 'utf8') + '\n})', { filename: file });
    wrapper(name => name in mocks ? mocks[name] : require(name), module, module.exports);
    return module.exports;
}
function fixture() {
    const rows = new Map(), checks = [], lists = [];
    let image = Buffer.from([255,216,255,1]);
    class Base { AppError(message) { throw new Error(message); } }
    const model = { CL: 'bx_feedback', getOne: async where => { const id = typeof where === 'string' ? where : where._id; const row = rows.get(id); return row && (!where.FEEDBACK_USER_ID || row.FEEDBACK_USER_ID === where.FEEDBACK_USER_ID) ? row : null; }, insert: async data => { if(rows.has(data._id)) throw Error('duplicate'); rows.set(data._id, {...data}); return data._id; }, getList: async (...args) => { lists.push(args); return { list: [], total: 0 }; }, edit: async (id, data) => { Object.assign(rows.get(id), data); } };
    const Service = load('cloudfunctions/mcloud/project/TRIP1/service/feedback_service.js', {
        '../../../framework/platform/service/base_service.js': Base,
        '../model/feedback_model.js': model,
        '../model/feedback_asset_model.js': {CL:'bx_feedback_asset',getOne:async()=>({})},
        '../../../framework/database/db_util.js': { isExistCollection: async()=>true },
        '../../../framework/utils/util.js': { getProjectId: ()=>'TRIP1' },
        '../../../framework/validate/content_check.js': { checkTextMultiClient: async data => checks.push(data), checkImgClient: async()=>{} },
        '../../../framework/cloud/cloud_base.js': { getCloud: ()=>({ downloadFile: async()=>({fileContent:image}) }) }
    });
    return { service: new Service(), rows, checks, lists, setImage: value=>image=value };
}
const input = () => ({ category: '服务建议', content: '希望增加沿途指示牌', phone: '', images: [], requestId: 'request_1234567890' });
test('submission validates, binds authenticated owner and retries without duplicates', async()=>{
    const f = fixture();
    const first = await f.service.submit('TRIP1^^^visitor-a', { ...input(), userId: 'visitor-b', status: 1 });
    const again = await f.service.submit('TRIP1^^^visitor-a', input());
    assert.equal(first.id,again.id); assert.equal(f.rows.size,1); assert.equal(f.rows.get(first.id).FEEDBACK_USER_ID,'TRIP1^^^visitor-a'); assert.equal(f.rows.get(first.id).FEEDBACK_STATUS,0);
    await f.service.submit('TRIP1^^^visitor-b', input()); assert.equal(f.rows.size,2);
    assert.equal(f.checks.length,2);
});
test('blank, overlong, invalid category/contact/request and foreign image paths are rejected', async()=>{
    for (const change of [{ content:'   ' }, {content:'长'.repeat(501)}, {category:'理赔'}, {phone:'123'}, {requestId:'bad'}, {images:['https://example.com/a.jpg']}, {images:['cloud://env/TRIP1/feedback/another-request/a.jpg']}, {images:Array(4).fill('cloud://env/TRIP1/feedback/request_1234567890/a.jpg')}]) {
        const f=fixture(); await assert.rejects(f.service.submit('a',{...input(),...change})); assert.equal(f.rows.size,0);
    }
});
test('image content and size are checked on the server',async()=>{
    const f=fixture(), data={...input(),images:['cloud://env/TRIP1/feedback/request_1234567890/0.jpg']};
    f.setImage(Buffer.from('not an image')); await assert.rejects(f.service.submit('a',data));
    f.setImage(Buffer.alloc(5*1024*1024+1)); await assert.rejects(f.service.submit('a',data));
    f.setImage(Buffer.from([255,216,255,1])); await f.service.submit('a',data); assert.equal(f.rows.size,1);
});
test('personal lists are owner scoped; admin lists include contact; reply persists', async()=>{
    const f=fixture(); await f.service.list('owner',2);
    assert.deepEqual(f.lists[0][0],{FEEDBACK_USER_ID:'owner'}); assert.equal(f.lists[0][3],2); assert(!f.lists[0][1].includes('PHONE'));
    await f.service.list('',1,true); assert.deepEqual(f.lists[1][0],{}); assert(f.lists[1][1].includes('PHONE'));
    const saved=await f.service.submit('owner',input()); await f.service.reply(saved.id,'感谢建议，我们会核实。'); assert.equal(f.rows.get(saved.id).FEEDBACK_STATUS,1); assert.equal(f.rows.get(saved.id).FEEDBACK_REPLY,'感谢建议，我们会核实。');
    await assert.rejects(f.service.reply(saved.id,' ')); await assert.rejects(f.service.reply('missing','谢谢反馈'));
});
test('admin controllers authenticate before reading or replying', async()=>{
    let called=false;
    class Base { async isAdmin(){throw Error('not admin')} validateData(){return {page:1}} }
    const Controller=load('cloudfunctions/mcloud/project/TRIP1/controller/admin/admin_feedback_controller.js',{'./base_project_admin_controller.js':Base,'../../service/feedback_service.js':class {list(){called=true}reply(){called=true}}});
    await assert.rejects(new Controller().list(),/not admin/); await assert.rejects(new Controller().reply(),/not admin/); assert.equal(called,false);
});
test('real controller validator allows feedback without images or phone',()=>{
    const dataCheck=require('../cloudfunctions/mcloud/framework/validate/data_check.js');
    class Base {validateData(rules){ return dataCheck.check(this.input,rules) }}
    const Controller=load('cloudfunctions/mcloud/project/TRIP1/controller/feedback_controller.js',{'./base_project_controller.js':Base,'../service/feedback_service.js':class{submit(owner,data){return {owner,data}}}});
    const controller=new Controller();controller.input=input();controller._userId='owner';
    return controller.submit().then(result=>{assert.equal(result.owner,'owner');assert.deepEqual(result.data.images,[]);assert.equal(result.data.phone,'')});
});
function pageFixture() {
    let page, fail = false, uploads = 0, calls = [], stop;
    const source = fs.readFileSync(path.join(root, 'miniprogram/projects/TRIP1/pages/feedback/index/feedback_index.js'), 'utf8');
    vm.runInNewContext(source, { require: name=>name.includes('cloud_helper') ? { callCloudSumbit: async (route,params)=> { if(route==='feedback/upload'){uploads++;return {data:{fileID:'cloud://env/TRIP1/feedback/'+params.requestId+'/0.jpg'}};} calls.push({route,params}); if(stop)await stop; if(fail)throw Error('offline'); return {data:{id:'saved'}} } } : name.includes('project_biz') ? {initPage(){}} : {getPID:()=> 'TRIP1',showNoneToast(){}}, Page: value=>page=value, wx: { getFileSystemManager:()=>({readFileSync:()=>Buffer.from([255,216,255,1]).toString('base64')}),cloud: {uploadFile: async ({cloudPath})=>{uploads++;return {fileID:'cloud://env/'+cloudPath}}} } });
    page={...page,data:{...page.data},setData(data){Object.assign(this.data,data)}};
    page.onLoad();
    page.setData({categoryIndex:2,content:'希望增加沿途指示牌',phone:'',images:[{path:'wxfile://tmp/test.jpg',fileID:''}]});
    return {page,calls,getUploads:()=>uploads,setFail:value=>fail=value,setStop:value=>stop=value};
}
test('front end retains input and uploaded image on failure, retries same ID, and clears after success',async()=>{
    const f=pageFixture();f.setFail(true);await f.page.submit();
    assert.equal(f.page.data.submitting,false);assert.equal(f.page.data.content,'希望增加沿途指示牌');assert.equal(f.page.data.submitted,false);assert.equal(f.getUploads(),1);
    const requestId=f.calls[0].params.requestId;f.setFail(false);await f.page.submit();
    assert.equal(f.calls[1].params.requestId,requestId);assert.equal(f.getUploads(),1);assert.equal(f.page.data.submitted,true);assert.equal(f.page.data.content,'');assert.equal(f.page.data.images.length,0);
});
test('front end prevents simultaneous submissions and rejects short content before calling backend',async()=>{
    const f=pageFixture();f.page.setData({images:[]});let release;
    f.setStop(new Promise(resolve=>release=resolve));const first=f.page.submit();await f.page.submit();assert.equal(f.calls.length,1);release();await first;
    f.page.setData({submitted:false,categoryIndex:1,content:'短'});await f.page.submit();assert.equal(f.calls.length,1);
});
test('all registered feedback pages and route targets exist; active visitor entry pages contain no booking/payment claims',()=>{
    const app=JSON.parse(fs.readFileSync(path.join(root,'miniprogram/app.json')));
    const registered=app.pages.concat((app.subpackages||[]).flatMap(pack=>pack.pages.map(page=>pack.root+'/'+page)));
    for(const name of ['feedback/index/feedback_index','admin/feedback/admin_feedback']){
        const file='projects/TRIP1/pages/'+name;assert(registered.includes(file));for(const ext of ['js','json','wxml','wxss'])assert(fs.existsSync(path.join(root,'miniprogram',file+'.'+ext)));
    }
    const routes=require('../cloudfunctions/mcloud/project/TRIP1/public/route.js');
    for(const name of ['feedback/submit','feedback/my_list','admin/feedback_list','admin/feedback_reply']){
        const [controller,action]=routes[name].split('@');assert(fs.existsSync(path.join(root,'cloudfunctions/mcloud/project/TRIP1/controller',controller+'.js')));assert(action);
    }
    for(const file of ['default/index/default_index.wxml','default/index/default_index.js','my/index/my_index.wxml','about/service/about_service.wxml']){
        const contents=fs.readFileSync(path.join(root,'miniprogram/projects/TRIP1/pages',file),'utf8');assert(!/预约|理赔|订单|支付|meet\//.test(contents));
    }
});
test('existing ORM retains deterministic document ID and project/owner isolation',async()=>{
    const base='cloudfunctions/mcloud/framework/';
    const util=require('../'+base+'utils/util.js'), dataUtil=require('../'+base+'utils/data_util.js'), timeUtil=require('../'+base+'utils/time_util.js'), AppError=require('../'+base+'core/app_error.js');
    let inserted, query;
    const Model=load(base+'database/model.js',{'./db_util.js':{insert:async(cl,data)=>{inserted=data;return data._id},getList:async(cl,where)=>{query=where;return {list:[]}}},'../utils/util.js':util,'../utils/time_util.js':timeUtil,'../utils/data_util.js':dataUtil,'../core/app_error.js':AppError,'../cloud/cloud_base.js':{}});
    const Multi=load(base+'database/multi_model.js',{'./model.js':Model,'../utils/util.js':{...util,getProjectId:()=> 'TRIP1'},'../utils/data_util.js':dataUtil,'../../config/config.js':{COLLECTION_PRFIX:'bx_'}});
    const Feedback=load('cloudfunctions/mcloud/project/TRIP1/model/feedback_model.js',{'./base_project_model.js':Multi});
    await Feedback.insert({_id:'a'.repeat(32),FEEDBACK_USER_ID:'owner',FEEDBACK_CATEGORY:'其他反馈',FEEDBACK_CONTENT:'真实反馈内容',FEEDBACK_PHONE:'',FEEDBACK_IMAGES:[],FEEDBACK_STATUS:0,FEEDBACK_REPLY:''});
    assert.equal(inserted._id,'a'.repeat(32));assert.equal(inserted._pid,'TRIP1');assert.equal(inserted.FEEDBACK_USER_ID,'owner');assert.equal(inserted.FEEDBACK_STATUS,0);
    await Feedback.getList({FEEDBACK_USER_ID:'owner'},'*',{},1,10,true,0);assert.deepEqual(query,{FEEDBACK_USER_ID:'owner',_pid:'TRIP1'});
});
test('targeted visitor attachment queries keep owner scope and request bounded signed URLs',async()=>{
 const requested=[];const queries=[];class Base{AppError(message){throw Error(message);}}
 const Service=load('cloudfunctions/mcloud/project/TRIP1/service/feedback_service.js',{'../../../framework/platform/service/base_service.js':Base,'../model/feedback_model.js':{CL:'bx_feedback',getList:async(...args)=>{queries.push(args);return {list:[{_id:'feedback',FEEDBACK_IMAGES:['cloud://private/file.jpg']}],total:1};}},'../model/feedback_asset_model.js':{},'../../../framework/database/db_util.js':{isExistCollection:async()=>true},'../../../framework/utils/util.js':{},'../../../framework/validate/content_check.js':{},'../../../framework/cloud/cloud_base.js':{getCloud:()=>({getTempFileURL:async params=>{requested.push(params);return {fileList:[{fileID:'cloud://private/file.jpg',tempFileURL:'https://private/signed'}]};}})},'./cms_validation.js':{id:value=>value}});
 const result=await new Service().list('owner',1,false,'feedback');assert.deepEqual(queries[0][0],{FEEDBACK_USER_ID:'owner',_id:'feedback'});assert(!queries[0][1].includes('PHONE'));assert.deepEqual(requested[0].fileList,[{fileID:'cloud://private/file.jpg',maxAge:900}]);assert.equal(result.list[0].FEEDBACK_IMAGE_URLS[0],'https://private/signed');
});
test('visitor previews fetch new owner-authorized URLs instead of using expired dataset URLs',async()=>{
 let definition;const calls=[],previews=[];vm.runInNewContext(fs.readFileSync(path.join(root,'miniprogram/projects/TRIP1/pages/feedback/index/feedback_index.js'),'utf8'),{require:n=>n.includes('cloud_helper')?{callCloudSumbit:async(route,params)=>{calls.push({route,params});return {data:{list:[{_id:'feedback',FEEDBACK_IMAGE_URLS:['https://fresh/first','https://fresh/second']}]}};}}:{},Page:value=>definition=value,wx:{previewImage:value=>previews.push(value)}});const p={...definition,data:{records:[{_id:'feedback',FEEDBACK_IMAGES:['https://expired']}]},setData(data){Object.assign(this.data,data);}};await p.previewRecord({currentTarget:{dataset:{id:'feedback',index:1,url:'https://expired'}}});assert.deepEqual(JSON.parse(JSON.stringify(calls[0])),{route:'feedback/my_list',params:{page:1,id:'feedback'}});assert.equal(previews[0].current,'https://fresh/second');assert.equal(p._previewing,false);
});
test('administrator image refresh preserves an unsaved reply',async()=>{
 let definition;const previews=[];vm.runInNewContext(fs.readFileSync(path.join(root,'miniprogram/projects/TRIP1/pages/admin/feedback/detail/feedback_detail.js'),'utf8'),{require:n=>n.includes('cloud_helper')?{callCloudData:async()=>({FEEDBACK_IMAGE_URLS:['https://fresh']})}:{},Page:value=>definition=value,wx:{previewImage:value=>previews.push(value)}});const p={...definition,id:'feedback',data:{reply:'未保存的回复',record:{FEEDBACK_CONTENT:'建议',FEEDBACK_IMAGE_URLS:['https://expired']}},setData(data){Object.assign(this.data,data);}};await p.preview({currentTarget:{dataset:{index:0}}});assert.equal(p.data.reply,'未保存的回复');assert.equal(p.data.record.FEEDBACK_CONTENT,'建议');assert.equal(previews[0].current,'https://fresh');
});

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
function load(file, context) {
    let result;
    vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),{
        Page: value=>result=value,Component:value=>result=value,Behavior:value=>value,module:{exports:{}},
        ...context,
    });
    return result;
}
function page(config) { return { ...config, data:{...config.data},setData(value){Object.assign(this.data,value)}}; }
test('list presentation properties do not change route, search, category, sort or pagination parameters',async()=>{
    let request;
    const config=load('miniprogram/cmpts/public/list/comm_list_cmpt.js',{require:name=>name.includes('cloud_helper')?{dataList:async (component,name,route,params)=>{request={route,params};component.data[name]={page:params.page,count:2,list:[]}}}:name.endsWith('/helper.js')?{isDefined:value=>value!==undefined}:name.includes('public_biz')?{setCacheList(){}}:{}});
    const component=page({data:{...Object.fromEntries(Object.entries(config.properties).map(([name,prop])=>[name,prop.value])),...config.data},...config.methods,triggerEvent(){}});
    component.setData({heading:'景区导览',headerHeight:220,bottomInset:100,route:'product/list',_params:{sortType:'cateId',sortVal:'2'},search:'山水',sortType:'sort',sortVal:'PRODUCT_VIEW_CNT|desc'});
    await component._getList(1);assert.equal(request.route,'product/list');assert.equal(JSON.stringify(request.params),JSON.stringify({page:1,sortType:'sort',sortVal:'PRODUCT_VIEW_CNT|desc',search:'山水'}));
    component.data._dataList=null;assert.doesNotThrow(()=>component.bindReachBottom());
});
test('news filters preserve original cateId and search while switching existing categories',()=>{
    let behavior;
    vm.runInNewContext(fs.readFileSync(path.join(root,'miniprogram/comm/behavior/news_index_bh.js'),'utf8'),{require:()=>({}),module:{exports:{}},Behavior:value=>{behavior=value;return value},wx:{setNavigationBarTitle(){}}});
    const instance=page({data:{search:'风景'},...behavior.methods});
    const categories=[{id:1,title:'景区动态',style:'upimg'},{id:2,title:'美食',style:'leftbig1'},{id:3,title:'特产',style:'leftbig3'}];
    instance._setCate(categories,{id:'1'});assert.equal(instance.data._params.cateId,'1');
    instance.bindNewsCategory({detail:{value:'2'}});assert.equal(instance.data._params.cateId,'2');assert.equal(instance.data.newsHeading,'美食');assert.equal(instance.data.search,'风景');
    instance.bindNewsCategory({detail:{value:'0'}});assert.equal(instance.data._params.cateId,'0');
});
test('public information refresh keeps the selected setup key',async()=>{
    const keys=[];
    const config=load('miniprogram/projects/TRIP1/pages/about/index/about_index.js',{require:name=>name.includes('project_setting')?{SETUP_CONTENT_ITEMS:[{key:'SETUP_CONTENT_BUS',title:'公交信息'}]}:name.includes('project_biz')?{initPage(){}}:{},wx:{stopPullDownRefresh(){}}});
    const instance=page({...config,_loadDetail:async key=>keys.push(key)});
    await instance.onLoad({key:'SETUP_CONTENT_BUS'});await instance.onPullDownRefresh();assert.deepEqual(keys,['SETUP_CONTENT_BUS','SETUP_CONTENT_BUS']);
});
test('detail sharing is safe before loading and with records that have no cover',()=>{
    for(const [kind,prefix] of [['product','PRODUCT'],['album','ALBUM'],['news','NEWS']]){
        const config=load('miniprogram/projects/TRIP1/pages/'+kind+'/detail/'+kind+'_detail.js',{require:()=>({})});
        const instance=page(config);assert.equal(Object.keys(instance.onShareAppMessage()).length,0);
        instance.data[kind]={[prefix+'_TITLE']:'真实标题',[prefix+'_OBJ']:{}};
        assert.equal(instance.onShareAppMessage().title,'真实标题');assert.equal(instance.onShareAppMessage().imageUrl,'');
    }
});
test('poster rendering accepts missing cover and QR without changing valid image URLs',async()=>{
    const module={exports:{}};
    vm.runInNewContext(fs.readFileSync(path.join(root,'miniprogram/cmpts/public/poster/poster_cmpt_helper.js'),'utf8'),{module,require:()=>({})});
    const empty=await module.exports.config1({title:'风景',desc:'介绍',cover:null,qr:undefined});assert.equal(empty.images.length,0);
    const filled=await module.exports.config1({title:'风景',desc:'介绍',cover:'/images/scenic.jpg',qr:'/images/qr.png'});assert.equal(filled.images[0].url,'/images/scenic.jpg');assert.equal(filled.images[1].url,'/images/qr.png');
});
test('three visitor tabs and their icons exist; public services remain accessible through normal pages',()=>{
    const app=JSON.parse(fs.readFileSync(path.join(root,'miniprogram/app.json')));assert.deepEqual(app.tabBar.list.map(item=>item.text),['首页','景区导览','园区攻略']);
    for(const item of app.tabBar.list){assert(app.pages.includes(item.pagePath));for(const key of ['iconPath','selectedIconPath'])assert(fs.existsSync(path.join(root,'miniprogram',item[key].replace(/^\//,''))));}
    assert(!app.tabBar.list.some(item=>item.pagePath.includes('about/service')));
    assert(fs.readFileSync(path.join(root,'miniprogram/projects/TRIP1/pages/default/index/default_index.wxml'),'utf8').includes('../../about/service/about_service'));
});
test('static page links and list routes resolve to existing registered business pages/interfaces',()=>{
    const app=JSON.parse(fs.readFileSync(path.join(root,'miniprogram/app.json'))),routes=require('../cloudfunctions/mcloud/project/TRIP1/public/route.js');
    const registered=app.pages.concat((app.subpackages||[]).flatMap(pack=>pack.pages.map(page=>pack.root+'/'+page)));
    const pages=['default/index/default_index','product/index/product_index','album/index/album_index','news/index/news_index','news/cate1/news_cate1','news/cate2/news_cate2','about/index/about_index','about/service/about_service','my/fav/my_fav','my/foot/my_foot','search/search','product/detail/product_detail','album/detail/album_detail','news/detail/news_detail'];
    for(const name of pages){
        const file='miniprogram/projects/TRIP1/pages/'+name+'.wxml',contents=fs.readFileSync(path.join(root,file),'utf8');
        for(const tag of contents.matchAll(/<(?:view|button|cmpt-comm-list)\b[^>]*>/g)){
            const route=(tag[0].match(/\broute="([^"]+)"/)||[])[1];if(route)assert(routes[route],route);
            const url=(tag[0].match(/\bdata-url="([^"{}]+)"/)||[])[1],type=(tag[0].match(/\bdata-type="([^"]+)"/)||[])[1]||'url';if(!url||!['url','relaunch','switch'].includes(type))continue;
            const target=(url.startsWith('/')?url.slice(1):path.posix.normalize(path.posix.join(path.posix.dirname(file).replace(/^miniprogram\//,''),url.split('?')[0])));
            assert(registered.includes(target),file+': '+url);
            if(type==='url')assert(!app.tabBar.list.some(item=>item.pagePath===target),'navigateTo cannot target '+target);
        }
    }
});

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
function helper(call){const module={exports:{}};vm.runInNewContext(fs.readFileSync('miniprogram/projects/TRIP1/ui/service_ui.js','utf8'),{module,require:()=>({callCloudSumbit:call})});return module.exports;}
test('service entries follow every published-list page and link to independent service details',async()=>{
 const calls=[];const api=helper(async(route,params)=>{calls.push({route,params});return {data:{total:51,list:params.page===1?Array.from({length:50},(_,i)=>({_id:'service-'+i,SERVICE_NAME:'服务'+i})): [{_id:'last',SERVICE_NAME:'最后一条'}]}};});
 const rows=await api.list();assert.equal(rows.length,51);assert.equal(rows.at(-1).url,'/projects/TRIP1/pages/about/index/about_index?serviceId=last');
 assert.deepEqual(calls.map(c=>c.params.page),[1,2]);assert(calls.every(c=>c.route==='cms/list'&&c.params.module==='service'));
});
test('refresh removes stale service entrances on failure, and latest successful refresh wins',async()=>{
 let complete;const api=helper(()=>new Promise(resolve=>complete=resolve));
 const page={data:{services:[{id:'deleted'}]},setData(v){Object.assign(this.data,v);}};
 const first=api.load(page),finishFirst=complete;const second=api.load(page),finishSecond=complete;
 finishSecond({data:{total:1,list:[{_id:'new',SERVICE_NAME:'新服务'}]}});await second;
 finishFirst({data:{total:1,list:[{_id:'old',SERVICE_NAME:'旧服务'}]}});await first;
 assert.equal(page.data.services[0].id,'new');
 await helper(async()=>{throw Error('network');}).load(page);
 assert.equal(page.data.services.length,0);assert.equal(page.data.servicesError,true);assert.equal(page.data.servicesLoading,false);
});
test('service detail never falls back to legacy setup or scenic content when unavailable',async()=>{
 let config;const calls=[];vm.runInNewContext(fs.readFileSync('miniprogram/projects/TRIP1/pages/about/index/about_index.js','utf8'),{Page:c=>config=c,require:name=>name.includes('cloud_helper')?{callCloudSumbit:async(route,params)=>{calls.push({route,params});throw Error('offline');}}:name.includes('project_setting')?{SETUP_CONTENT_ITEMS:[]}: {},Behavior:v=>v});
 const page={...config,data:{serviceId:'deleted',about:['stale']},setData(v){Object.assign(this.data,v);}};
 await page.loadAbout();assert.equal(page.data.about.length,0);assert.equal(page.data.serviceUnavailable,true);assert.equal(calls.length,1);assert.equal(calls[0].params.module,'service');
});
test('service list deletion checks permission and confirmation before calling only its own module',async()=>{
 let config,confirmed=false,calls=[],refresh=0;
 vm.runInNewContext(fs.readFileSync('miniprogram/projects/TRIP1/pages/admin/cms/list/cms_list.js','utf8'),{Page:c=>config=c,require:name=>name.includes('cms_ui')?{confirm:async()=>confirmed,call:async(action,params)=>calls.push({action,...params})}:{},wx:{showToast(){}}});
 const page={...config,data:{module:'service',records:[{id:'parking',name:'停车'}],canDelete:false},setData(v){Object.assign(this.data,v);},load:async()=>refresh++};
 const event={currentTarget:{dataset:{id:'parking'}}};
 await page.removeService(event);assert.equal(calls.length,0);
 page.data.canDelete=true;await page.removeService(event);assert.equal(calls.length,0);assert.equal(page.data.deleting,false);
 confirmed=true;await page.removeService(event);assert.deepEqual(calls,[{action:'remove',module:'service',id:'parking'}]);assert.equal(refresh,1);
});

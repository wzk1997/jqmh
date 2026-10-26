const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

function load(){
 const module={exports:{}},requests=[],dialogs=[],logs=[];
 vm.runInNewContext(fs.readFileSync('miniprogram/helper/cloud_helper.js','utf8'),{
  module,console:{error:(...args)=>logs.push(args)},
  require:name=>name.includes('ui_preview')?{isEnabled:()=>false}:name==='./helper.js'?{isDefined:value=>value!==undefined}:name.includes('cache_helper')?{get:()=>null}:name.includes('page_helper')?{getPID:()=> 'TRIP1'}:{},
  wx:{cloud:{callFunction:options=>requests.push(options)},showLoading(){},showNavigationBarLoading(){},showModal:options=>dialogs.push(options)}
 });
 return {api:module.exports,requests,dialogs,logs};
}

test('cloud failures retain original SDK error and background diagnostics without exposing request params',async()=>{
 const {api,requests,dialogs,logs}=load();
 const error={errCode:-1,errMsg:'network connection failed',requestID:'request-1'};
 const promise=api.callCloudSumbit('admin/cms_list',{secret:'private'},{hint:false});
 const rejected=assert.rejects(promise,value=>value===error);
 requests[0].fail(error);await rejected;
 assert.equal(dialogs.length,0);
 assert.equal(logs[0][1].route,'admin/cms_list');
 assert.equal(logs[0][1].requestId,'request-1');
 assert(!JSON.stringify(logs).includes('private'));
});

test('cloud errors distinguish timeout, execution and resource failures from network failures',async()=>{
 for(const [message,label] of [['Task timed out','响应超时'],['cloud function execution error','执行异常'],['RESOURCE_INSUFFICIENT','资源额度'],['network connection failed','网络连接失败'],['unknown failure','云服务调用失败']]){
  const {api,requests,dialogs}=load(),error={errCode:-123,errMsg:message};
  const promise=api.callCloudSumbit('news/list');const rejected=assert.rejects(promise,value=>value===error);
  requests[0].fail(error);await rejected;
  assert(dialogs[0].content.includes(label));assert(dialogs[0].content.includes('-123'));
 }
});

test('parallel failures show one dialog and allow another after dismissal without retrying requests',async()=>{
 const {api,requests,dialogs}=load();
 async function fail(){const promise=api.callCloudSumbit('news/list');const rejected=assert.rejects(promise);requests.at(-1).fail({errMsg:'network failed'});await rejected;}
 await fail();await fail();assert.equal(dialogs.length,1);assert.equal(requests.length,2);
 dialogs[0].complete();await fail();assert.equal(dialogs.length,2);assert.equal(requests.length,3);
});

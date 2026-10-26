const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const inventory=require('../miniprogram/projects/TRIP1/ui/admin_modules.js');

test('permission editor only displays and submits active menu modules',async()=>{
 let config,submitted;
 vm.runInNewContext(fs.readFileSync('miniprogram/projects/TRIP1/pages/admin/mgr/permissions/admin_permissions.js','utf8'),{
  Page:value=>config=value,
  require:name=>name.includes('admin_modules')?inventory:name.includes('admin_biz')?{}:name.includes('cms_ui')?{confirm:async()=>true}:{callCloudSumbit:async(route,params)=>{
   if(route==='admin/mgr_detail')return {data:{ADMIN_TYPE:0,ADMIN_NAME:'ordinary',ADMIN_PERMISSIONS:{album:['read'],service:['read','write']}}};
   submitted=params;return {};
  }},
  wx:{showToast(){},navigateBack(){}}
 });
 const page={...config,id:'ordinary-id',data:{...config.data},setData(values){Object.assign(this.data,values)}};
 await page.load();
 assert.equal(page.data.error,false);
 assert.deepEqual(Array.from(page.data.rows,row=>row.id),['scenic','album','product','merchant','news','feedback']);
 assert.deepEqual(Array.from(page.data.rows.find(row=>row.id==='feedback').ops,op=>op.key),['read','write']);
 assert.equal(page.data.rows.find(row=>row.id==='album').ops.find(op=>op.key==='read').checked,true);
 await page.save();
 assert.deepEqual(Object.keys(submitted.permissions),['scenic','album','product','merchant','news','feedback']);
 assert.deepEqual(Array.from(submitted.permissions.album),['read']);
});

test('admin statistics omit retired modules even when an older server returns them',()=>{
 const rows=[{module:'service',title:'服务数',cnt:8},{title:'服务数',cnt:8},{title:'全景资源',cnt:3},{module:'panorama',title:'全景',cnt:4},{title:'预约项目',cnt:5},{title:'精选推荐',cnt:6},{title:'景区介绍',cnt:1},{module:'album',title:'攻略数',cnt:2},{title:'商家数',cnt:7}];
 const stats=inventory.visibleStats(rows,id=>id!=='merchant');
 assert.deepEqual(stats,[{module:'scenic',title:'园区简介',cnt:1},{module:'album',title:'攻略数',cnt:2}]);
 assert.deepEqual(inventory.visibleStats(null,()=>true),[]);
 assert.deepEqual(inventory.MODULES.map(item=>item.id),['scenic','album','product','merchant','news','service','feedback']);
});

test('admin refresh rebuilds permitted menus and rejects retired module navigation',async()=>{
 let config,admin={permissions:{album:['read']}},navigations=[];
 const can=(user,id)=>Boolean(user.permissions[id]?.includes('read'));
 vm.runInNewContext(fs.readFileSync('miniprogram/projects/TRIP1/pages/admin/index/home/admin_home.js','utf8'),{
  Page:value=>config=value,console,
  require:name=>name.includes('admin_modules')?inventory:name.includes('cms_ui')?{can}:name.includes('admin_biz')?{getAdminToken:()=>admin}:name.includes('cloud_helper')?{callCloudData:async()=>[{title:'全景资源',cnt:9},{title:'攻略数',cnt:2}]}:{},
  wx:{navigateTo:options=>navigations.push(options.url)}
 });
 const page={...config,data:{...config.data},setData(values){Object.assign(this.data,values)}};
 await page._loadDetail();
 assert.deepEqual(Array.from(page.data.modules,item=>item.id),['album']);
 assert.equal(page.data.stat.length,1);
 for(const id of ['panorama','meet','scenic','service'])page.openModule({currentTarget:{dataset:{id}}});
 assert.equal(navigations.length,0);
 page.openModule({currentTarget:{dataset:{id:'album'}}});
 assert(navigations[0].endsWith('?module=album'));
 admin={permissions:{scenic:['read'],album:['read'],service:['read']}};
 await page._loadDetail();
 assert.deepEqual(Array.from(page.data.modules,item=>item.id),['scenic','album']);
 assert.equal(typeof page.bindMoreTap,'undefined');
 assert.equal(typeof page._clearVouch,'undefined');
});

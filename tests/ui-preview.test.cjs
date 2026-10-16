const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const preview=require('../miniprogram/projects/TRIP1/ui/ui_preview.js');
test('preview records resolve their own details and use existing bundled assets',()=>{
 const ids=new Set();
 for(const [module,rows] of Object.entries(preview.modules)){
  assert(rows.length>0);
  for(const row of rows){
   assert(!ids.has(row._id));ids.add(row._id);
   assert.deepEqual(preview.respond('cms/detail',{module,id:row._id}).data,row);
  }
 }
 function images(value){if(typeof value==='string'&&value.startsWith('/projects/'))assert(fs.existsSync(path.join(__dirname,'../miniprogram',value)));else if(value&&typeof value==='object')Object.values(value).forEach(images);}
 images(preview.modules);
 for(const row of preview.modules.album)for(const spot of row.ALBUM_SPOTS)assert.equal(preview.respond('product/view',{id:spot._id}).data._id,spot._id);
});
test('preview lists filter categories and search, paginate, and keep merchant streams separate',()=>{
 for(const category of ['food','stay','travel']){
  const result=preview.respond('cms/list',{module:'merchant',category}).data;
  assert.equal(result.total,3);assert(result.list.every(r=>r.MERCHANT_CATEGORY===category));
 }
 const a=preview.respond('product/list',{page:1,size:2}).data,b=preview.respond('product/list',{page:2,size:2}).data;
 assert.equal(a.total,6);assert.equal(a.count,3);assert.equal(b.list.length,2);assert.notEqual(a.list[0]._id,b.list[0]._id);
 assert.equal(preview.respond('product/list',{search:'湖畔观景台'}).data.total,1);
 assert(preview.respond('news/list',{cateId:'announcement'}).data.list.every(r=>r.NEWS_CATE_ID==='announcement'));
 assert.equal(preview.respond('album/list',{sortType:'cateId',sortVal:'3'}).data.list[0].ALBUM_CATE_NAME,'住宿');
 const altered=preview.respond('product/list').data;altered.list[0].PRODUCT_TITLE='changed';assert.notEqual(preview.modules.product[0].PRODUCT_TITLE,'changed');
});
test('preview blocks unknown and admin API calls and labels simulated feedback',()=>{
 for(const route of ['admin/login','admin/cms_save','unknown/list'])assert.throws(()=>preview.respond(route),/不调用/);
 const result=preview.respond('feedback/submit');assert.equal(result.preview,true);assert.equal(result.data.id,'local-preview-feedback');
 assert.throws(()=>preview.respond('news/view',{id:'not-real'}),/不存在/);
 const helper=fs.readFileSync(path.join(__dirname,'../miniprogram/helper/cloud_helper.js'),'utf8');
 assert(helper.indexOf('preview.respond(route, params)')<helper.indexOf('wx.cloud.callFunction'));
});

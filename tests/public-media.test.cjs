const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const path=require('node:path');
function service(cloud={}) {const mod={exports:{}};vm.runInThisContext('(function(require,module,exports){'+fs.readFileSync(path.join(__dirname,'../cloudfunctions/mcloud/project/TRIP1/service/public_media_service.js'),'utf8')+'\n})')(n=>n.endsWith('cloud_base.js')?{getCloud:()=>cloud}:{CLOUD_ID:'test-env'},mod,mod.exports);return mod.exports;}
const file=(type,id,name='cover.jpg')=>'cloud://test-env.bucket/TRIP1/'+type+'/'+id+'/'+name;
test('published response media excludes feedback, arbitrary client IDs, drafts and other record namespaces',()=>{
 const s=service(),own=file('news','n'),privateFile=file('feedback','secret');
 const row={_id:'n',NEWS_PIC:[own,privateFile,file('news','other'),file('news','n','../secret.jpg'),'cloud://other.bucket/TRIP1/news/n/cover.jpg'],NEWS_DRAFT:{cover:file('news','n','draft.jpg')}};
 assert.deepEqual(s.collect('news/view',row,{},'test-env'),[own]);
 assert.deepEqual(s.collect('feedback/my_detail',row,{},'test-env'),[]);
 assert.deepEqual(s.collect('admin/cms_detail',row,{module:'news'},'test-env'),[]);
 assert.deepEqual(s.collect('fav/list',{list:[{id:'n',pic:own}]},{},'test-env'),[]);
 assert.deepEqual(s.collect('cms/detail',row,{module:'feedback'},'test-env'),[]);
});
test('portal and itinerary sign only their canonical content folders without changing payload IDs',async()=>{
 const s=service(),scenic=file('scenic','s'),spot=file('product','p'),album=file('album','a');
 const portal={scenic:{_id:'s',SCENIC_IMAGES:[scenic]},slides:[{image:scenic},{image:file('scenic','other')}],featured:[{type:'album',id:'a',pic:album}]};
 assert.deepEqual(s.collect('home/portal',portal,{},'test-env'),[scenic,album]);
 const row={_id:'a',ALBUM_OBJ:{cover:[album]},ALBUM_SPOTS:[{_id:'p',cover:spot}]};
 const original=JSON.stringify(row);assert.deepEqual(s.collect('album/view',row,{},'test-env'),[album,spot]);assert.equal(JSON.stringify(row),original);
});
test('URL signing batches at fifty and tolerates missing files without exposing storage errors',async()=>{
 const calls=[],s=service({getTempFileURL:async input=>{calls.push(input);return {fileList:input.fileList.map(({fileID},i)=>({fileID,status:i===0?-1:0,tempFileURL:'https://example.test/photo'}))};}});
 const row={id:'n',pic:Array.from({length:101},(_,i)=>file('news','n',i+'.jpg'))};
 const result=await s.urls('news/list',{list:[row]});assert.deepEqual(calls.map(c=>c.fileList.length),[50,50,1]);assert(calls.every(c=>c.fileList.every(f=>f.maxAge===3600)));assert.equal(Object.keys(result).length,98);assert.equal(row.pic[1],file('news','n','1.jpg'));
});
test('display cache preserves cloud IDs and does not retain expired signed addresses',()=>{
 const module={exports:{}},updates=[];let now=0;
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../miniprogram/helper/media_helper.js'),'utf8'),{module,Date:{now:()=>now},getCurrentPages:()=>[{setData:v=>updates.push(v)}]});
 const s=module.exports,id=file('news','n');s.remember({[id]:'https://example.test/image'});assert.equal(s.display(id),'https://example.test/image');assert.equal(s.display('/local.jpg'),'/local.jpg');assert.equal(updates.length,1);now=3600000;assert.equal(s.display(id),id);s.remember({});assert.equal(Object.keys(updates.at(-1).mediaUrls).length,0);
});
test('administrator media includes scoped drafts and uploads, but rejects unrelated namespaces and routes',async()=>{
 const calls=[],s=service({getTempFileURL:async input=>{calls.push(input);return {fileList:input.fileList.map(({fileID})=>({fileID,status:0,tempFileURL:'https://example.test/admin-image'}))};}});
 const draft=file('news','n','draft.jpg'),privateFile=file('feedback','f');
 const row={_id:'n',NEWS_DRAFT:{NEWS_PIC:[draft,privateFile,file('news','other')]}};
 assert.deepEqual(s.collectAdmin('admin/cms_detail',row,{module:'news'},'test-env'),[draft]);
 assert.deepEqual(s.collect('news/view',row,{},'test-env'),[]);
 assert.deepEqual(s.collectAdmin('admin/cms_upload',{fileID:draft},{module:'news',id:'n'},'test-env'),[draft]);
 assert.deepEqual(s.collectAdmin('admin/cms_save',row,{module:'news'},'test-env'),[]);
 await s.adminUrls('admin/cms_detail',row,{module:'news'});assert.equal(calls[0].fileList[0].maxAge,900);
});
test('draft display URLs stay on authenticated management pages and never enter the visitor cache',()=>{
 const mod={exports:{}},visitor={route:'projects/TRIP1/pages/default/index/default_index',data:{},setData(v){Object.assign(this.data,v)}},admin={route:'projects/TRIP1/pages/admin/cms/edit/cms_edit',data:{},setData(v){Object.assign(this.data,v)}},preview={route:'projects/TRIP1/pages/about/index/about_index',data:{adminPreview:true},setData(v){Object.assign(this.data,v)}};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../miniprogram/helper/media_helper.js'),'utf8'),{module:mod,Date,getCurrentPages:()=>[visitor,admin,preview]});const s=mod.exports,id=file('news','n','draft.jpg');
 s.rememberAdmin({[id]:'https://example.test/private'});assert.equal(visitor.data.mediaUrls,undefined);assert.equal(s.display(id),id);assert.equal(s.snapshot()[id],undefined);assert.equal(s.display(id,admin.data.mediaUrls),'https://example.test/private');assert.equal(preview.data.mediaUrls[id],'https://example.test/private');
});

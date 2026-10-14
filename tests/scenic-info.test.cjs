const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function page(){let def;const previews=[],locations=[],copies=[];vm.runInNewContext(fs.readFileSync(path.join(root,'miniprogram/projects/TRIP1/pages/about/index/about_index.js'),'utf8'),{Page:p=>def=p,require:n=>n.endsWith('/media_helper.js')?require('../miniprogram/helper/media_helper.js'):{},wx:{previewImage:p=>previews.push(p),openLocation:p=>locations.push(p),setClipboardData:p=>copies.push(p)}});return {p:{...def,data:structuredClone(def.data),setData(p){Object.assign(this.data,p)}},previews,locations,copies};}
test('scenic presentation derives cards and gallery filters from saved metadata without invented facts',()=>{
 const {p}=page();p.prepareScenic({SCENIC_NAME:'WeTravel',SCENIC_IMAGES:['one.jpg','two.jpg'],SCENIC_INFO:{highlights:[{title:'森林',imageIndex:2}],galleryTags:['云海','森林']}});assert.equal(p.data.sections[0].items[0].image,'two.jpg');assert.equal(p.data.facts.length,0);assert.equal(p.data.traffic.length,0);assert.equal(p.data.mapMarkers.length,0);p.filterGallery({currentTarget:{dataset:{filter:'森林'}}});assert.equal(p.data.displayGallery.length,1);assert.equal(p.data.displayGallery[0].image,'two.jpg');
});
test('scenic actions use real gallery photos, saved address and zero-safe coordinates',()=>{
 const {p,previews,locations,copies}=page();const record={SCENIC_NAME:'WeTravel',SCENIC_ADDRESS:'景区地址',SCENIC_IMAGES:['one.jpg','two.jpg'],SCENIC_INFO:{latitude:0,longitude:120}};p.prepareScenic(record);p.data.scenicRecord=record;p.preview({currentTarget:{dataset:{src:'two.jpg'}}});assert.equal(previews[0].urls.length,2);p.copyAddress();assert.equal(copies[0].data,'景区地址');p.openMap();assert.equal(locations[0].latitude,0);assert.equal(p.data.mapMarkers[0].longitude,120);p.data.info={};p.openMap();assert.equal(locations.length,1);const share=p.onShareAppMessage();assert(!share.path.includes('adminPreview'));
});
test('scenic editor preserves optional fields, typed photo selections and entered album tags',()=>{
 let def;vm.runInNewContext(fs.readFileSync(path.join(root,'miniprogram/cmpts/biz/scenic_info_editor/scenic_info_editor.js'),'utf8'),{Component:c=>def=c,wx:{showToast(){}}});const c={...def.methods,data:{...structuredClone(def.data),info:{tagline:'自然为伴',highlights:[{title:'森林',desc:'介绍',imageIndex:1}],galleryTags:['森林']},images:['one.jpg']},setData(p){for(const[key,val]of Object.entries(p)){const parts=key.split('.');let obj=this.data;for(const part of parts.slice(0,-1))obj=obj[part];obj[parts.at(-1)]=val;}}};def.observers.info.call(c,c.data.info);c.field({currentTarget:{dataset:{key:'tips'}},detail:{value:'注意天气变化'}});c.card({currentTarget:{dataset:{group:'highlights',index:0,key:'imageIndex'}},detail:{value:'0'}});c.tag({currentTarget:{dataset:{index:0}},detail:{value:'自然'}});const out=c.getValue();assert.equal(out.tips,'注意天气变化');assert.equal(out.highlights[0].imageIndex,0);assert.equal(out.galleryTags[0],'自然');assert.equal(out.tagline,'自然为伴');
});
test('removed four-season metadata is discarded while remaining practical fields still validate',()=>{
 const validate=require('../cloudfunctions/mcloud/project/TRIP1/service/scenic_info_validation.js');
 const old=validate({},[]);assert.equal(Object.hasOwn(old,'seasons'),false);assert.equal(old.visitDuration,'');
 const input={visitDuration:'半天至一天',seasons:[{season:'spring',title:'春日山林',desc:'春日游览建议',imageIndex:1}]};
 const result=validate(input,['one.jpg']);assert.equal(Object.hasOwn(result,'seasons'),false);assert.equal(result.visitDuration,input.visitDuration);
 assert.throws(()=>validate({visitDuration:'长'.repeat(101)},[]),/时长/);
});

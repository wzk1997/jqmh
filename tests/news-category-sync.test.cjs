const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ui=require('../miniprogram/projects/TRIP1/ui/content_ui.js');
function fixture(){
 let categories=[{id:'1',name:'园区公告'},{id:'town',name:'街区活动'}],failed=false;const requests=[];
 const rows=Array.from({length:45},(_,i)=>({_id:'news-'+i,NEWS_TITLE:'活动通知'+i,NEWS_CATE_ID:i<40?'1':'town',NEWS_CATE_NAME:'旧分类名称',NEWS_STATUS:1,NEWS_DELETED:false,NEWS_PIC:['/cover.jpg']}));
 const mod={exports:{}};
 vm.runInNewContext(fs.readFileSync('cloudfunctions/mcloud/project/TRIP1/service/news_service.js','utf8'),{module:mod,require:name=>name.includes('base_project_service')?class{}:name.includes('cms_service')?{categories:async()=>categories}:name.includes('news_model')?{getList:async(where,fields,order,page=1,size=20)=>{requests.push({where,page,size});const ids=where.NEWS_CATE_ID[1];const selected=rows.filter(row=>row.NEWS_STATUS===where.NEWS_STATUS&&!row.NEWS_DELETED&&ids.includes(row.NEWS_CATE_ID));return {list:selected.slice((page-1)*size,page*size),total:selected.length};}}:{isDefined:v=>v!==undefined,escapeRegex:v=>v}});
 const service=new mod.exports();let config;
 vm.runInNewContext(fs.readFileSync('miniprogram/projects/TRIP1/pages/news/index/news_index.js','utf8'),{Page:c=>config=c,wx:{setNavigationBarTitle(){}},require:name=>name.includes('cloud_helper')?{callCloudSumbit:async()=>{if(failed)throw Error('network');return {data:categories};}}:name.includes('project_biz')?{initPage(){}}:name.includes('content_ui')?ui:{}});
 const page={...config,data:structuredClone(config.data),setData(values){Object.assign(this.data,values);}};
 return {page,service,requests,setCategories:value=>categories=value,fail:value=>failed=value};
}
test('backend category 1 is ordinary; custom category retrieves its full server-filtered list beyond the first page',async()=>{
 const f=fixture();await f.page.onLoad({});assert.equal(f.page.data.newsCategory,'0');
 const all=await f.service.getNewsList({...f.page.data._params,page:1});assert.equal(all.total,45);assert.equal(all.list.length,20);
 f.page.data.search='查询词';f.page.bindNewsCategory({detail:{value:'town'}});
 assert.equal(f.page.data._params.cateId,'town');assert.equal(f.page.data.search,'查询词');
 const selected=await f.service.getNewsList({...f.page.data._params,page:1});assert.equal(selected.total,5);assert(selected.list.every(row=>row.NEWS_CATE_NAME==='街区活动'));
 f.page.data.dataList=selected;f.page.filterContent();assert.equal(f.page.data.visibleNews.length,5);assert(f.page.data.visibleNews.every(row=>row.categoryId==='town'&&row.label==='街区活动'));
 f.page.bindNewsCategory({detail:{value:'1'}});assert.equal(f.page.data.newsHeading,'园区公告');assert.equal(f.page.data._params.cateId,'1');
 const second=await f.service.getNewsList({...f.page.data._params,page:2});assert.equal(second.list.length,20);assert(second.list.every(row=>row.NEWS_CATE_ID==='1'));
});
test('renaming and unpublishing backend categories refreshes frontend labels and resets a removed selection',async()=>{
 const f=fixture();await f.page.onLoad({id:'1'});f.page.data.dataList={list:[{id:'a',cateId:'1',cateName:'旧分类名称',title:'活动资讯'}]};
 f.setCategories([{id:'1',name:'最新公告'},{id:'town',name:'街区活动'}]);await f.page.onShow();
 assert.equal(f.page.data.newsHeading,'最新公告');assert.equal(f.page.data.newsFilters[1].label,'最新公告');assert.equal(f.page.data.visibleNews[0].label,'最新公告');
 f.setCategories([{id:'town',name:'街区活动'}]);await f.page.onShow();assert.equal(f.page.data.newsCategory,'0');assert.equal(f.page.data._params.cateId,'0');assert.equal(f.page.data.visibleNews.length,0);
 const result=await f.service.getNewsList({...f.page.data._params,page:1});assert.equal(result.total,5);
 const invalid=await f.service.getNewsList({cateId:'1',page:1,size:20});assert.equal(invalid.total,0);
});
test('category failures do not start an unfiltered list; retry and empty categories remain consistent',async()=>{
 const f=fixture();f.fail(true);await f.page.onLoad({id:'1'});assert.equal(f.page.data.categoriesError,true);assert.equal(f.page.data._params,undefined);
 f.fail(false);await f.page.loadCategories();assert.equal(f.page.data._params.cateId,'1');assert.equal(f.page.data.categoriesError,false);
 f.setCategories([]);await f.page.onShow();assert.equal(f.page.data.newsFilters.length,1);assert.equal(f.page.data.newsCategory,'0');
 const empty=await f.service.getNewsList({...f.page.data._params,page:1});assert.equal(empty.total,0);
});
test('published category set changes reload all-news while removing stale category cards immediately',async()=>{
 const f=fixture();await f.page.onLoad({});let reloads=0;f.page.selectComponent=()=>({reload:async()=>reloads++});
 f.page.data.dataList={list:[{id:'old',cateId:'1',title:'旧资讯'},{id:'keep',cateId:'town',title:'活动'}]};
 f.setCategories([{id:'town',name:'街区活动'}]);await f.page.onShow();assert.equal(reloads,1);assert.equal(f.page.data.visibleNews.length,1);assert.equal(f.page.data.visibleNews[0].id,'keep');
});
test('a slow previous category response cannot overwrite the latest list or pagination',async()=>{
 const source=fs.readFileSync('miniprogram/helper/cloud_helper.js','utf8');const start=source.indexOf('async function dataList('),end=source.indexOf('\nasync function getTempFileURLOne',start);let dataList;const pending=[];
 vm.runInNewContext(source.slice(start,end)+'\nexpose(dataList);',{expose:f=>dataList=f,console:{log(){}},helper:{isDefined:v=>v!==undefined},callCloud:()=>new Promise(resolve=>pending.push(resolve))});
 const page={data:{rows:{page:1,list:[],total:0}},setData(v){Object.assign(this.data,v);}};let current=1;
 const first=dataList(page,'rows','news/list',{page:1,cateId:'1'},{isCurrent:()=>current===1});current=2;
 const second=dataList(page,'rows','news/list',{page:1,cateId:'town'},{isCurrent:()=>current===2});
 pending[1]({data:{page:1,list:[{id:'current'}],total:1}});await second;
 pending[0]({data:{page:1,list:[{id:'stale'}],total:40}});await first;
 assert.equal(page.data.rows.list[0].id,'current');assert.equal(page.data.rows.total,1);
});

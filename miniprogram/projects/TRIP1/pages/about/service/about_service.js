const pageHelper=require('../../../../../helper/page_helper.js');
const cloudHelper=require('../../../../../helper/cloud_helper.js');
const ProjectBiz=require('../../../biz/project_biz.js');
const {normalizeContent}=require('../../../ui/content_ui.js');
const PAGE_SIZE=30;
function merge(old,rows){const seen=new Set();return old.concat(rows).filter(row=>row.id&&!seen.has(row.id)&&(seen.add(row.id),true));}
function hasMore(result,page){const rows=result.list||[];return rows.length>0&&(typeof result.total==='number'?page*PAGE_SIZE<result.total:rows.length===PAGE_SIZE);}
Page({
 bindScenicLayout(e){this.setData({uiChrome:e.detail});},
 data:{serviceTab:'food',items:[],merchants:[],loading:false,error:false,partialError:false,legacyPage:0,merchantPage:0,legacyHasMore:false,merchantHasMore:false,legacyError:false,merchantError:false,hasMore:false},
 onLoad(options={}){ProjectBiz.initPage(this);this.setData({serviceTab:['food','stay','travel'].includes(options.tab)?options.tab:'food'});this.load();},
 async load(more=false,retryOnly=false){
  more=more===true;if(more&&this.data.loading)return;
  const tab=this.data.serviceTab,serial=this.serial=(this.serial||0)+1;
  const state=more?{...this.data}:{items:[],merchants:[],legacyPage:0,merchantPage:0,legacyHasMore:false,merchantHasMore:false,legacyError:false,merchantError:false};
  const tasks=[];
  if(tab==='stay'&&(!more||state.legacyError||!retryOnly&&state.legacyHasMore))tasks.push({kind:'legacy',page:state.legacyPage+1,route:'album/list',params:{sortType:'cateId',sortVal:'3'}});
  if(!more||state.merchantError||!retryOnly&&state.merchantHasMore)tasks.push({kind:'merchant',page:state.merchantPage+1,route:'cms/list',params:{module:'merchant',category:tab}});
  if(!tasks.length)return;
  this.setData({...state,loading:true,error:false,partialError:false});
  const results=await Promise.allSettled(tasks.map(task=>cloudHelper.callCloudSumbit(task.route,{...task.params,page:task.page,size:PAGE_SIZE},{hint:false})));
  if(serial!==this.serial)return;
  results.forEach((result,index)=>{
   const task=tasks[index],kind=task.kind;
   state[kind+'Error']=result.status==='rejected';if(result.status==='rejected')return;
   const data=result.value.data||{},rows=data.list||[];
   state[kind+'Page']=task.page;state[kind+'HasMore']=hasMore(data,task.page);
   if(kind==='legacy')state.items=merge(state.items,rows.map(row=>normalizeContent(row,'album')));
   else state.merchants=merge(state.merchants,rows.map(row=>({id:row._id,title:row.MERCHANT_NAME,desc:row.MERCHANT_DESC,pic:(row.MERCHANT_IMAGES||[])[0]||'',phone:row.MERCHANT_DEMO?'':row.MERCHANT_PHONE,demo:row.MERCHANT_DEMO,path:'../merchant/merchant_detail?id='+row._id})));
  });
  const failed=state.legacyError||state.merchantError,empty=!state.items.length&&!state.merchants.length;
  this.setData({...state,loading:false,error:!!failed&&empty,partialError:!!failed&&!empty,hasMore:state.legacyHasMore||state.merchantHasMore});
 },
 loadMore(){if(this.data.hasMore)return this.load(true);},retry(){return this.load(true,true);},onReachBottom(){return this.loadMore();},
 bindServiceTab(e){this.setData({serviceTab:e.currentTarget.dataset.tab});this.load();},
 onPullDownRefresh(){this.load().finally(()=>wx.stopPullDownRefresh());},url(e){pageHelper.url(e,this);}
});

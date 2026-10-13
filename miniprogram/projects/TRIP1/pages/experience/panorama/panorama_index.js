const ProjectBiz=require('../../../biz/project_biz.js');
const cloud=require('../../../../../helper/cloud_helper.js');
function scene(row){return {id:row._id,title:row.PANORAMA_NAME,pic:(row.PANORAMA_COVER||[])[0]||'',resource:row.PANORAMA_RESOURCE,type:row.PANORAMA_RESOURCE_TYPE};}
Page({
 data:{current:0,playing:false,scenes:[],loading:false,error:false,page:0,hasMore:false},
 bindScenicLayout(e){this.setData({uiChrome:e.detail});},
 onLoad(options={}){ProjectBiz.initPage(this,{isSetNavColor:false});this.requestedId=options.id||'';this.loadResources();},
 async loadResources(more=false){
  more=more===true;if(more&&(this.data.loading||!this.data.hasMore))return;
  const serial=this.requestSerial=(this.requestSerial||0)+1,page=more?this.data.page+1:1;
  if(!more)this.stop();this.setData({loading:true,error:false,...(more?{}:{scenes:[],current:0,page:0,hasMore:false})});
  try{
   const res=await cloud.callCloudSumbit('cms/list',{module:'panorama',page,size:20},{hint:false});
   const rows=res.data.list||[];let scenes=rows.map(scene),current=0;
   if(!more&&this.requestedId){
    current=scenes.findIndex(row=>row.id===this.requestedId);
    if(current<0){const detail=await cloud.callCloudSumbit('cms/detail',{module:'panorama',id:this.requestedId},{hint:false});scenes.unshift(scene(detail.data));current=0;}
   }
   if(serial!==this.requestSerial)return;
   const all=more?this.data.scenes.concat(scenes):scenes;
   this.setData({scenes:all.filter((row,index)=>all.findIndex(r=>r.id===row.id)===index),page,hasMore:rows.length>0&&page*20<res.data.total,...(more?{}:{current:Math.max(0,current)})});
  }catch(_){if(serial===this.requestSerial)this.setData({error:true});}
  finally{if(serial===this.requestSerial)this.setData({loading:false});}
 },
 loadMore(){return this.loadResources(true);},
 onPullDownRefresh(){this.loadResources().finally(()=>wx.stopPullDownRefresh());},
 bindOpen(){const current=this.data.scenes[this.data.current];if(!current)return;
  if(current.type==='url'){this.stop();wx.navigateTo({url:'/projects/TRIP1/pages/experience/webview/panorama_webview?id='+current.id});}
  else if(current.type==='provider')wx.showToast({title:'此场景尚未配置查看服务',icon:'none'});
  else if(current.resource||current.pic){const image=require('../../../../../helper/media_helper.js').display(current.resource||current.pic);wx.previewImage({current:image,urls:[image]});}
 },
 bindSelect(e){const index=Number(e.currentTarget.dataset.index);if(!Number.isInteger(index)||!this.data.scenes[index])return;this.stop();this.setData({current:index});},
 bindPrevious(){if(!this.data.scenes.length)return;this.stop();this.setData({current:(this.data.current+this.data.scenes.length-1)%this.data.scenes.length});},
 bindNext(){if(this.data.scenes.length)this.setData({current:(this.data.current+1)%this.data.scenes.length});},
 bindPlay(){if(this.data.playing){this.stop();return;}if(this.data.scenes.length<2)return;this.setData({playing:true});this.timer=setInterval(()=>this.bindNext(),4000);},
 stop(){if(this.timer)clearInterval(this.timer);this.timer=null;this.setData({playing:false});},
 onHide(){this.stop();},onUnload(){this.requestSerial=(this.requestSerial||0)+1;this.stop();},
 bindPreview(){this.bindOpen();}
});

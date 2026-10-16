const cloud=require('../../../helper/cloud_helper.js');
// Only canonical published rows are returned by cms/list; follow pagination so no service is silently lost.
async function list(){
 const items=[];let page=1;
 while(true){
  const result=await cloud.callCloudSumbit('cms/list',{module:'service',page,size:50},{hint:false});
  const data=result&&result.data;if(!data||!Array.isArray(data.list))throw new Error('服务信息加载失败');
  items.push(...data.list);
  if(!data.list.length || (typeof data.total==='number'?page*50>=data.total:data.list.length<50))break;
  if(++page>10000)throw new Error('服务列表过长');
 }
 return items.map(row=>({id:row._id,title:row.SERVICE_NAME,desc:row.SERVICE_DESC||'查看服务信息',url:'/projects/TRIP1/pages/about/index/about_index?serviceId='+encodeURIComponent(row._id)}));
}
async function load(page){
 const serial=page.serviceSerial=(page.serviceSerial||0)+1;
 page.setData({services:[],servicesLoading:true,servicesError:false});
 try{const services=await list();if(serial===page.serviceSerial)page.setData({services,servicesLoaded:true});}
 catch(_){if(serial===page.serviceSerial)page.setData({servicesError:true});}
 finally{if(serial===page.serviceSerial)page.setData({servicesLoading:false});}
}
module.exports={list,load};

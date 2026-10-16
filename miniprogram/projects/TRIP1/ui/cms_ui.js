const cloudHelper=require('../../../helper/cloud_helper.js');
const META={scenic:{title:'园区简介',icon:'icon-home'},album:{title:'园区攻略',icon:'icon-pic'},merchant:{title:'吃住行管理',icon:'icon-shop'},news:{title:'活动资讯',icon:'icon-form'},product:{title:'景点管理',icon:'icon-location'},category:{title:'分类管理',icon:'icon-cascades'}};
const STATES={draft:'草稿',published:'已发布',offline:'已下架',deleted:'已删除'};
function normalize(kind,row){
 const p=kind==='category'?'CONTENT_CATEGORY_':kind.toUpperCase()+'_',obj=row[p+'OBJ']||{};
 const state=row.cmsState||row[p+'CMS_STATE']||row[p+'STATE']||(row[p+'STATUS']===1?'published':'offline');
 const images=row[p+'IMAGES']||row[p+'COVER']||row[p+'PIC']||obj.cover||[];
 const content=row[p+'CONTENT']||obj.detail||[];
 return {id:row._id,name:row[p+'NAME']||row[p+'TITLE']||'',desc:row[p+'DESC']||obj.desc||'',images,content,cover:images[0]||'',state,stateLabel:STATES[state]||'草稿',hasDraft:row.hasDraft||Object.keys(row[p+'DRAFT']||{}).length>0,
 order:row[p+'ORDER']===undefined?9999:row[p+'ORDER'],category:row[p+'CATEGORY']||row[p+'CATE_ID']||'',categoryName:row[p+'CATE_NAME']||({food:'餐饮',stay:'住宿',travel:'交通'}[row[p+'CATEGORY']])||'',phone:row[p+'PHONE']||'',address:row[p+'ADDRESS']||obj.address||'',hours:row[p+'HOURS']||obj.time||'',
 activityStart:row.NEWS_ACTIVITY_START||'',activityEnd:row.NEWS_ACTIVITY_END||'',
 module:row.CONTENT_CATEGORY_MODULE||'',key:row.CONTENT_CATEGORY_KEY||'',spots:obj.spots||[],raw:row,
 date:row[p+'EDIT_TIME']?new Date(row[p+'EDIT_TIME']).toLocaleDateString():'',publishedAt:row[p+'PUBLISH_TIME']?new Date(row[p+'PUBLISH_TIME']).toLocaleString():''};
}
function can(admin,module,operation){
 if(!admin)return false;
 if(Number(admin.type)===1)return true;
 const permissions=admin.permissions||{};
 if(!Object.keys(permissions).length)return true;
 return Array.isArray(permissions[module])&&permissions[module].includes(operation);
}
async function call(action,params){try {const result=await cloudHelper.callCloudSumbit('admin/cms_'+action,params,{title:'bar'});return result.data;}catch(err){throw new Error(err.msg||err.message||'操作失败，请重试');}}
function confirm(content){return new Promise(resolve=>wx.showModal({title:'确认操作',content,confirmColor:'#a44736',success:r=>resolve(r.confirm),fail:()=>resolve(false)}));}
function go(page,module,id='',categoryModule=''){wx.navigateTo({url:'/projects/TRIP1/pages/admin/cms/'+page+'/cms_'+page+'?module='+module+(id?'&id='+id:'')+(categoryModule?'&categoryModule='+categoryModule:'')});}
async function upload(module,id,path){if(!path||path.startsWith('cloud://')||path.startsWith('/images/'))return path;
 const base64=wx.getFileSystemManager().readFileSync(path,'base64');const result=await call('upload',{module,id,base64});return result.fileID;}
module.exports={META,STATES,can,normalize,call,confirm,go,upload};

const AdminBiz=require('../../../../../../comm/biz/admin_biz.js');
const cloud=require('../../../../../../helper/cloud_helper.js');
const cms=require('../../../../ui/cms_ui.js');
const MODULES=require('../../../../ui/admin_modules.js').MODULES.map(item=>[item.id,item.title]);
const OPS=[['read','查看'],['write','编辑'],['publish','发布/下架'],['delete','删除']];
Page({data:{loading:true,error:false,saving:false,rows:[],name:''},onLoad(o){if(!AdminBiz.isAdmin(this,true))return;this.id=o.id;this.load();},
 async load(){this.setData({loading:true,error:false});try{const result=await cloud.callCloudSumbit('admin/mgr_detail',{id:this.id},{title:'bar'});const admin=result.data;if(!admin||admin.ADMIN_TYPE===1)throw Error('超级管理员权限不能修改');const permissions=admin.ADMIN_PERMISSIONS||{};const legacy=!Object.keys(permissions).length;this.setData({name:admin.ADMIN_DESC||admin.ADMIN_NAME,rows:MODULES.map(([id,name])=>({id,name,ops:OPS.filter(([key])=>id!=='feedback'||['read','write'].includes(key)).map(([key,label])=>({key,label,checked:legacy||(permissions[id]||[]).includes(key)}))}))});}catch(err){this.setData({error:true,message:err.message||err.msg||'加载失败'});}finally{this.setData({loading:false});}},
 toggle(e){const {module,op}=e.currentTarget.dataset;this.setData({rows:this.data.rows.map(row=>row.id!==module?row:{...row,ops:row.ops.map(item=>item.key!==op?item:{...item,checked:!item.checked})})});},
 async save(){if(this.data.saving||!await cms.confirm('确认保存权限？该管理员需要重新登录，新的权限才会生效。'))return;const permissions=Object.fromEntries(this.data.rows.map(row=>[row.id,row.ops.filter(op=>op.checked).map(op=>op.key)]));this.setData({saving:true});try{await cloud.callCloudSumbit('admin/mgr_permissions',{id:this.id,permissions});wx.showToast({title:'权限已保存'});wx.navigateBack();}catch(_){}finally{this.setData({saving:false});}}
});

const AdminBiz=require('../../../../../../comm/biz/admin_biz.js');
const cms=require('../../../../ui/cms_ui.js');
Page({data:{module:'',title:'内容管理',records:[],search:'',state:'',category:'',categoryModule:'news',loading:false,error:false,page:0,hasMore:false,states:[{id:'',name:'全部'},{id:'published',name:'已发布'},{id:'draft',name:'草稿'},{id:'offline',name:'已下架'}],categories:[{id:'',name:'全部分类'}],categoryIndex:0,merchantTabs:[{id:'',name:'全部'},{id:'stay',name:'住宿'},{id:'food',name:'餐饮'},{id:'travel',name:'交通'}]},
 onLoad(o){if(!AdminBiz.isAdmin(this))return;const module=cms.META[o.module]?o.module:'news';const permissionModule=module==='category'?(o.categoryModule||'news'):module;this.setData({module,title:cms.META[module].title,categoryModule:o.categoryModule||'news',canWrite:cms.can(AdminBiz.getAdminToken(),permissionModule,'write'),canDelete:cms.can(AdminBiz.getAdminToken(),permissionModule,'delete')});if(['news','album','product'].includes(module))this.loadCategories();},
 onShow(){if(this.data.module&&AdminBiz.isAdmin(this))this.load();},
 async load(more=false){if(more===true&&this.data.loading)return;const serial=this.requestSerial=(this.requestSerial||0)+1;const page=more===true?this.data.page+1:1,size=this.data.module==='category'?50:20;this.setData({loading:true,error:false,...(more===true?{}:{records:[],hasMore:false})});try{const result=await cms.call('list',{module:this.data.module,page,size,search:this.data.search,state:this.data.state,category:this.data.category,categoryModule:this.data.categoryModule});if(serial!==this.requestSerial)return;const rows=result.list.map(r=>cms.normalize(this.data.module,r));this.setData({records:page===1?rows:this.data.records.concat(rows),page,hasMore:page*size<result.total});}catch(_){if(serial===this.requestSerial)this.setData({error:true});}finally{if(serial===this.requestSerial)this.setData({loading:false});}},
 async loadCategories(){try{const rows=await cms.call('categories',{module:this.data.module});this.setData({categories:[{id:'',name:'全部分类'}].concat(rows)});}catch(_){}},
 pickCategory(e){const index=Number(e.detail.value);this.setData({categoryIndex:index,category:this.data.categories[index].id});this.load();},
 inputSearch(e){this.setData({search:e.detail.value});},search(){this.load();},filter(e){this.setData({[e.currentTarget.dataset.field]:e.currentTarget.dataset.id});this.load();},
 add(){cms.go('edit',this.data.module,'',this.data.categoryModule);},detail(e){cms.go('detail',this.data.module,e.currentTarget.dataset.id,this.data.categoryModule);},
 async removeService(e){
  if(this.data.module!=='service'||!this.data.canDelete||this.data.deleting)return;
  const row=this.data.records.find(item=>item.id===e.currentTarget.dataset.id);if(!row)return;
  this.setData({deleting:true,deleteError:''});
  try{if(!await cms.confirm('确认删除服务“'+row.name+'”？删除后游客端不再显示，原数据会保留。'))return;
   await cms.call('remove',{module:'service',id:row.id});await this.load();wx.showToast({title:'服务已删除'});
  }catch(error){this.setData({deleteError:error.message||'删除失败，请重试'});}finally{this.setData({deleting:false});}
 },
 async removeCategory(e){
  if(this.data.module!=='category'||!this.data.canDelete||this.data.deleting)return;
  const row=this.data.records.find(item=>item.id===e.currentTarget.dataset.id);if(!row)return;
  this.setData({deleting:true,deleteError:''});
  try{if(!await cms.confirm('确认删除分类“'+row.name+'”？有关联内容时需先调整内容分类。'))return;
   await cms.call('remove',{module:'category',id:row.id,categoryModule:this.data.categoryModule});await this.load();wx.showToast({title:'分类已删除'});
  }catch(error){this.setData({deleteError:error.message||'删除失败，请重试'});}finally{this.setData({deleting:false});}
 },
 categories(){cms.go('list','category','',this.data.module);},onReachBottom(){if(this.data.hasMore&&!this.data.error)this.load(true);},onPullDownRefresh(){this.load().finally(()=>wx.stopPullDownRefresh());}
});

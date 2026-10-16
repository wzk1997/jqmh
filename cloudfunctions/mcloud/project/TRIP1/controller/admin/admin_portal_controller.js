const Base=require('./base_project_admin_controller.js');
const Portal=require('../../service/home_portal_service.js');
const Cms=require('../../service/admin/admin_cms_service.js');
const v=require('../../service/cms_validation.js');
class AdminPortalController extends Base {
 async authorize(op){await this.isAdmin();this.requirePermission('scenic',op);}
 async get(){await this.authorize('read');const service=new Portal(),record=await service.get(),config=record.draft||record.published,referenceNames={};
  if(config){const refs=[...(config.featured||[]),...(config.slides||[]).filter(s=>s.target).map(s=>s.target),...(config.scenicId?[{module:'scenic',id:config.scenicId}]:[])];
   await Promise.all(refs.map(async ref=>{const row=await service.resolve(ref);if(row)referenceNames[ref.module+':'+ref.id]=row.title||row[ref.module.toUpperCase()+'_NAME'];}));}
  return {...record,referenceNames};}
 async save(){await this.authorize('write');const result=await new Portal().save(this._request.config,this._adminId);await this.logOther('保存首页配置草稿');return result;}
 async publish(){await this.authorize('publish');const result=await new Portal().publish(this._adminId);await this.logOther('发布首页配置');return result;}
 async upload(){await this.authorize('write');return new Cms().upload('scenic',v.id(this._request.scenicId),this._request.base64,this._adminId);}
 async choices(){await this.authorize('read');const module=this._request.module;if(!['scenic','album','product','news','merchant'].includes(module))v.fail('内容模块不正确');this.requirePermission(module,'read');return new Cms().list(module,{page:this._request.page,size:20,search:this._request.search},true);}
}
module.exports=AdminPortalController;

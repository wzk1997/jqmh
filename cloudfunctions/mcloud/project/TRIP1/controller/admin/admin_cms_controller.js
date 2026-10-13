const BaseController = require('./base_project_admin_controller.js');
const CmsService = require('../../service/admin/admin_cms_service.js');
const v = require('../../service/cms_validation.js');
class AdminCmsController extends BaseController {
    async authorize(operation) {
        await this.isAdmin();
        const input=this._request || {}, module=v.text(input.module,'管理模块',30,true);
        if(!['scenic','news','album','product','merchant','panorama','category'].includes(module))v.fail('管理模块不正确');
        const permissionModule=module==='category'?v.text(input.categoryModule || input.data && input.data.module,'分类模块',30,true):module;
        if(module==='category'&&!['news','album','product'].includes(permissionModule))v.fail('分类模块不正确');
        this.requirePermission(permissionModule,operation);
        return {input,module,service:new CmsService()};
    }
    async list() {
        const {input,module,service}=await this.authorize('read');
        return service.list(module,{...input,module:input.categoryModule});
    }
    async detail() {
        const {input,module,service}=await this.authorize('read');
        const row=await service.detail(module,input.id);
        if(module==='category' && row.CONTENT_CATEGORY_MODULE!==input.categoryModule)v.fail('分类模块不匹配');
        if(module==='album')row.relatedSpots=(await service.spots({ids:(row.ALBUM_OBJ||{}).spots||[],size:1})).selected;
        return row;
    }
    async save() {
        const {input,module,service}=await this.authorize('write');
        if(!input.data||typeof input.data!=='object'||Array.isArray(input.data))v.fail('内容不正确');
        if(module==='category' && input.categoryModule !== input.data.module)v.fail('分类模块不匹配');
        if(module==='category'&&input.data.id){const row=await service.detail(module,input.data.id);if(row.CONTENT_CATEGORY_MODULE!==input.data.module)v.fail('不能更换分类所属模块');}
        const result=await service.save(module,input.data,this._adminId);
        await this.logOther('保存'+module+'内容 '+result.id);return result;
    }
    async state() {
        const {input,module,service}=await this.authorize('publish');
        if(module==='category'){const row=await service.detail(module,input.id);if(row.CONTENT_CATEGORY_MODULE!==input.categoryModule)v.fail('分类模块不匹配');}
        const result=await service.setState(module,input.id,input.state,this._adminId);
        await this.logOther('设置'+module+'内容状态 '+result.id+' '+result.state);return result;
    }
    async remove() {
        const {input,module,service}=await this.authorize('delete');
        if(module==='category'){const row=await service.detail(module,input.id);if(row.CONTENT_CATEGORY_MODULE!==input.categoryModule)v.fail('分类模块不匹配');}
        const result=await service.remove(module,input.id,this._adminId);
        await this.logOther('软删除'+module+'内容 '+result.id);return result;
    }
    async upload() {
        const {input,module,service}=await this.authorize('write');
        if(module==='category')v.fail('分类不支持上传');
        return service.upload(module,input.id,input.base64,this._adminId);
    }
    async reserveDemo(){await this.isSuperAdmin();const key=v.id(this._request.key);const spec=require('../../public/cms_demo_data.js').find(row=>row.key===key);if(!spec)v.fail('演示内容标识不正确');for(const op of ['write','publish'])this.requirePermission(spec.module,op);const result=await new CmsService().reserveDemo(key,this._adminId);await this.logOther('准备演示内容 '+result.id);return result;}
    async spots(){const {input,module,service}=await this.authorize('read');if(module!=='album')v.fail('仅攻略可查询关联景点');return service.spots(input);}
    async categories() {
        await this.isAdmin();const module=v.text(this._request.module,'模块',30,true);
        if(!['news','album','product'].includes(module))v.fail('模块不正确');this.requirePermission(module,'read');
        return require('../../service/cms_service.js').categories(module);
    }
}
module.exports=AdminCmsController;

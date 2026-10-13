const BaseController=require('./base_project_controller.js');
const service=require('../service/cms_service.js');
class CmsController extends BaseController {
    async list(){return service.list(this._request.module,this._request);}
    async detail(){return service.detail(this._request.module,this._request.id);}
    async categories(){return service.categories(this._request.module);}
}
module.exports=CmsController;

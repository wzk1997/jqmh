const BaseProjectModel = require('./base_project_model.js');
class Model extends BaseProjectModel {}
Model.CL = BaseProjectModel.C('cms_asset');
Model.FIELD_PREFIX = 'CMS_ASSET_';
Model.UPDATE_IP = false;
Model.DB_STRUCTURE = {
    _pid: 'string|true',
    CMS_ASSET_ID: 'string|true',
    CMS_ASSET_FILE_ID: 'string|false|default=',
    CMS_ASSET_MODULE: 'string|false|default=',
    CMS_ASSET_RECORD_ID: 'string|false|default=',
    CMS_ASSET_ADMIN_ID: 'string|false|default=',
    CMS_ASSET_SIZE: 'int|false|default=0',
    CMS_ASSET_MIME: 'string|false|default=',
    CMS_ASSET_ADD_TIME: 'int|true',
    CMS_ASSET_EDIT_TIME: 'int|true',
};
module.exports = Model;

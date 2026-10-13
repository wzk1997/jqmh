const BaseProjectModel = require('./base_project_model.js');
class ScenicModel extends BaseProjectModel {}
ScenicModel.CL = BaseProjectModel.C('scenic');
ScenicModel.FIELD_PREFIX = 'SCENIC_';
ScenicModel.UPDATE_IP = false;
ScenicModel.DB_STRUCTURE = {
    _id: 'string|false',
    SCENIC_DEMO: 'bool|false|default=false',
    SCENIC_DRAFT: 'object|false|default={}',
    SCENIC_INFO: 'object|false|default={}',
    _pid:'string|true', SCENIC_ID:'string|true', SCENIC_NAME:'string|true',
    SCENIC_DESC:'string|false', SCENIC_ADDRESS:'string|false', SCENIC_HOURS:'string|false',
    SCENIC_PHONE:'string|false', SCENIC_IMAGES:'array|true|default=[]', SCENIC_CONTENT:'array|true|default=[]',
    SCENIC_STATE:'string|true|default=draft', SCENIC_ORDER:'int|true|default=9999',
    SCENIC_DELETED:'bool|true|default=false', SCENIC_PUBLISH_TIME:'int|false|default=0',
    SCENIC_EDIT_ADMIN:'string|false', SCENIC_ADD_TIME:'int|true', SCENIC_EDIT_TIME:'int|true'
};
module.exports = ScenicModel;

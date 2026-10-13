const BaseProjectModel = require('./base_project_model.js');
class Model extends BaseProjectModel {}
Model.CL = BaseProjectModel.C('panorama');
Model.FIELD_PREFIX = 'PANORAMA_';
Model.UPDATE_IP = false;
Model.DB_STRUCTURE = {
    _id: 'string|false',
    PANORAMA_DEMO: 'bool|false|default=false',
    PANORAMA_DRAFT: 'object|false|default={}',
    _pid: 'string|true',
    PANORAMA_ID: 'string|true',
    PANORAMA_NAME: 'string|false|default=',
    PANORAMA_DESC: 'string|false|default=',
    PANORAMA_COVER: 'array|false|default=[]',
    PANORAMA_RESOURCE_TYPE: 'string|false|default=',
    PANORAMA_RESOURCE: 'string|false|default=',
    PANORAMA_CONTENT: 'array|false|default=[]',
    PANORAMA_STATE: 'string|false|default=draft',
    PANORAMA_ORDER: 'int|false|default=9999',
    PANORAMA_DELETED: 'bool|false|default=false',
    PANORAMA_PUBLISH_TIME: 'int|false|default=0',
    PANORAMA_EDIT_ADMIN: 'string|false|default=',
    PANORAMA_ADD_TIME: 'int|true',
    PANORAMA_EDIT_TIME: 'int|true',
};
module.exports = Model;

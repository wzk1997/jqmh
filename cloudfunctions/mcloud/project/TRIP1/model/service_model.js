const BaseProjectModel = require('./base_project_model.js');
class Model extends BaseProjectModel {}
Model.CL = BaseProjectModel.C('service');
Model.FIELD_PREFIX = 'SERVICE_';
Model.UPDATE_IP = false;
Model.DB_STRUCTURE = {
    _id: 'string|false',
    SERVICE_DEMO: 'bool|false|default=false',
    SERVICE_DRAFT: 'object|false|default={}',
    _pid: 'string|true',
    SERVICE_ID: 'string|true',
    SERVICE_NAME: 'string|false|default=',
    SERVICE_DESC: 'string|false|default=',
    SERVICE_PHONE: 'string|false|default=',
    SERVICE_ADDRESS: 'string|false|default=',
    SERVICE_HOURS: 'string|false|default=',
    SERVICE_IMAGES: 'array|false|default=[]',
    SERVICE_CONTENT: 'array|false|default=[]',
    SERVICE_STATE: 'string|false|default=draft',
    SERVICE_ORDER: 'int|false|default=9999',
    SERVICE_DELETED: 'bool|false|default=false',
    SERVICE_PUBLISH_TIME: 'int|false|default=0',
    SERVICE_EDIT_ADMIN: 'string|false|default=',
    SERVICE_ADD_TIME: 'int|true',
    SERVICE_EDIT_TIME: 'int|true',
};
module.exports = Model;

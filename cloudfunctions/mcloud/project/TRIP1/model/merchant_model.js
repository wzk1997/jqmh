const BaseProjectModel = require('./base_project_model.js');
class Model extends BaseProjectModel {}
Model.CL = BaseProjectModel.C('merchant');
Model.FIELD_PREFIX = 'MERCHANT_';
Model.UPDATE_IP = false;
Model.DB_STRUCTURE = {
    _id: 'string|false',
    MERCHANT_DEMO: 'bool|false|default=false',
    MERCHANT_DRAFT: 'object|false|default={}',
    _pid: 'string|true',
    MERCHANT_ID: 'string|true',
    MERCHANT_NAME: 'string|false|default=',
    MERCHANT_CATEGORY: 'string|false|default=',
    MERCHANT_DESC: 'string|false|default=',
    MERCHANT_PHONE: 'string|false|default=',
    MERCHANT_ADDRESS: 'string|false|default=',
    MERCHANT_HOURS: 'string|false|default=',
    MERCHANT_IMAGES: 'array|false|default=[]',
    MERCHANT_CONTENT: 'array|false|default=[]',
    MERCHANT_STATE: 'string|false|default=draft',
    MERCHANT_ORDER: 'int|false|default=9999',
    MERCHANT_DELETED: 'bool|false|default=false',
    MERCHANT_PUBLISH_TIME: 'int|false|default=0',
    MERCHANT_EDIT_ADMIN: 'string|false|default=',
    MERCHANT_ADD_TIME: 'int|true',
    MERCHANT_EDIT_TIME: 'int|true',
};
module.exports = Model;

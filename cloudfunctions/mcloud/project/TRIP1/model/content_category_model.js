const BaseProjectModel = require('./base_project_model.js');
class Model extends BaseProjectModel {}
Model.CL = BaseProjectModel.C('content_category');
Model.FIELD_PREFIX = 'CONTENT_CATEGORY_';
Model.UPDATE_IP = false;
Model.DB_STRUCTURE = {
    _id: 'string|false',
    _pid: 'string|true',
    CONTENT_CATEGORY_ID: 'string|true',
    CONTENT_CATEGORY_MODULE: 'string|false|default=',
    CONTENT_CATEGORY_KEY: 'string|false|default=',
    CONTENT_CATEGORY_NAME: 'string|false|default=',
    CONTENT_CATEGORY_DRAFT: 'object|false|default={}',
    CONTENT_CATEGORY_STATE: 'string|false|default=draft',
    CONTENT_CATEGORY_ORDER: 'int|false|default=9999',
    CONTENT_CATEGORY_DELETED: 'bool|false|default=false',
    CONTENT_CATEGORY_PUBLISH_TIME: 'int|false|default=0',
    CONTENT_CATEGORY_EDIT_ADMIN: 'string|false|default=',
    CONTENT_CATEGORY_ADD_TIME: 'int|true',
    CONTENT_CATEGORY_EDIT_TIME: 'int|true',
};
module.exports = Model;

const BaseProjectModel = require('./base_project_model.js');
class FeedbackModel extends BaseProjectModel {}
FeedbackModel.CL = BaseProjectModel.C('feedback');
FeedbackModel.FIELD_PREFIX = 'FEEDBACK_';
FeedbackModel.UPDATE_IP = false;
FeedbackModel.DB_STRUCTURE = {
    _id: 'string|true', _pid: 'string|true', FEEDBACK_ID: 'string|true',
    FEEDBACK_USER_ID: 'string|true', FEEDBACK_CATEGORY: 'string|true',
    FEEDBACK_CONTENT: 'string|true', FEEDBACK_PHONE: 'string|false',
    FEEDBACK_IMAGES: 'array|true|default=[]', FEEDBACK_STATUS: 'int|true|default=0',
    FEEDBACK_PROCESS_TIME: 'int|false|default=0', FEEDBACK_PROCESS_ADMIN: 'string|false',
    FEEDBACK_REPLY_TIME: 'int|false|default=0',
    FEEDBACK_REPLY: 'string|false|default=',
    FEEDBACK_ADD_TIME: 'int|true', FEEDBACK_EDIT_TIME: 'int|true'
};
module.exports = FeedbackModel;

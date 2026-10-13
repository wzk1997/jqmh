/**
 * Notes: 资讯实体
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2020-10-28 19:20:00 
 */


const BaseProjectModel = require('./base_project_model.js');

class NewsModel extends BaseProjectModel {

}

// 集合名
NewsModel.CL = BaseProjectModel.C('news');

NewsModel.DB_STRUCTURE = {
    _id: 'string|false',
    NEWS_DEMO: 'bool|false|default=false',
    NEWS_DRAFT: 'object|false|default={}',
	_pid: 'string|true',
	NEWS_ID: 'string|true',  

	NEWS_TITLE: 'string|false|comment=标题',
	NEWS_DESC: 'string|false|comment=描述',
	NEWS_STATUS: 'int|true|default=1|comment=状态 0/1',

	NEWS_CATE_ID: 'string|true|comment=分类编号',
	NEWS_CATE_NAME: 'string|true|comment=分类冗余',

	NEWS_ORDER: 'int|true|default=9999', 
	NEWS_VOUCH: 'int|true|default=0',

	NEWS_CONTENT: 'array|true|default=[]|comment=内容', 

	NEWS_QR: 'string|false',
	NEWS_VIEW_CNT: 'int|true|default=0|comment=访问次数',  

	NEWS_PIC: 'array|false|default=[]|comment=封面图  [cloudId1,cloudId2,cloudId3...]',

	NEWS_FORMS: 'array|true|default=[]',
	NEWS_OBJ: 'object|true|default={}',

	NEWS_ADD_TIME: 'int|true',
	NEWS_EDIT_TIME: 'int|true',
	NEWS_ADD_IP: 'string|false',
	NEWS_EDIT_IP: 'string|false',
    NEWS_ACTIVITY_START: 'string|false',
    NEWS_ACTIVITY_END: 'string|false',
    NEWS_CMS_STATE: 'string|false|default=|comment=draft/published/offline/deleted',
    NEWS_PUBLISH_TIME: 'int|false|default=0',
    NEWS_DELETED: 'bool|false|default=false',
    NEWS_DELETED_TIME: 'int|false|default=0',
    NEWS_EDIT_ADMIN: 'string|false',
    NEWS_REVISION: 'int|false|default=0',

};

// 字段前缀
NewsModel.FIELD_PREFIX = "NEWS_";


module.exports = NewsModel;
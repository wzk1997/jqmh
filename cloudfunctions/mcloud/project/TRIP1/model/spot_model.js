/**
 * Notes:  景点实体
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2022-06-08 19:20:00
 */


const BaseProjectModel = require('./base_project_model.js');

class SpotModel extends BaseProjectModel {

}

// 集合名
SpotModel.CL = BaseProjectModel.C('spot');

SpotModel.DB_STRUCTURE = {
    _id: 'string|false',
    SPOT_DEMO: 'bool|false|default=false',
    SPOT_DRAFT: 'object|false|default={}',
	_pid: 'string|true',
	SPOT_ID: 'string|true',

	SPOT_TITLE: 'string|true|comment=标题',
	SPOT_STATUS: 'int|true|default=1|comment=状态 0=未启用,1=使用中',

	SPOT_CATE_ID: 'string|true|default=0|comment=分类',
	SPOT_CATE_NAME: 'string|false|comment=分类冗余',

	SPOT_ORDER: 'int|true|default=9999',
	SPOT_VOUCH: 'int|true|default=0',

	SPOT_FORMS: 'array|true|default=[]',
	SPOT_OBJ: 'object|true|default={}',

	SPOT_QR: 'string|false',
	SPOT_VIEW_CNT: 'int|true|default=0',

	SPOT_ADD_TIME: 'int|true',
	SPOT_EDIT_TIME: 'int|true',
	SPOT_ADD_IP: 'string|false',
	SPOT_EDIT_IP: 'string|false',
    SPOT_CMS_STATE: 'string|false|default=|comment=draft/published/offline/deleted',
    SPOT_PUBLISH_TIME: 'int|false|default=0',
    SPOT_DELETED: 'bool|false|default=false',
    SPOT_DELETED_TIME: 'int|false|default=0',
    SPOT_EDIT_ADMIN: 'string|false',
    SPOT_REVISION: 'int|false|default=0',

};

// 字段前缀
SpotModel.FIELD_PREFIX = "SPOT_";

/**
 * 状态 0=未启用,1=使用中
 */
SpotModel.STATUS = {
	UNUSE: 0,
	COMM: 1
};



module.exports = SpotModel;

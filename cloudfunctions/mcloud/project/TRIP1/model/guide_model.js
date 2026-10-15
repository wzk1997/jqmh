/**
 * Notes:  园区攻略实体
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2022-06-05 19:20:00
 */


const BaseProjectModel = require('./base_project_model.js');

class GuideModel extends BaseProjectModel {

}

// 集合名
GuideModel.CL = BaseProjectModel.C('guide');

GuideModel.DB_STRUCTURE = {
    _id: 'string|false',
    GUIDE_DEMO: 'bool|false|default=false',
    GUIDE_DURATION: 'string|false|default=',
    GUIDE_ROUTE: 'array|false|default=[]',
    GUIDE_DRAFT: 'object|false|default={}',
    _pid: 'string|true',
    GUIDE_ID: 'string|true',

    GUIDE_TITLE: 'string|true|comment=标题',
    GUIDE_STATUS: 'int|true|default=1|comment=状态 0=未启用,1=使用中',

    GUIDE_CATE_ID: 'string|true|default=0|comment=分类',
    GUIDE_CATE_NAME: 'string|false|comment=分类名冗余',

    GUIDE_ORDER: 'int|true|default=9999',
    GUIDE_VOUCH: 'int|true|default=0',

    GUIDE_FORMS: 'array|true|default=[]',
    GUIDE_OBJ: 'object|true|default={}',

	GUIDE_QR: 'string|false',
    GUIDE_VIEW_CNT: 'int|true|default=0',

    GUIDE_ADD_TIME: 'int|true',
    GUIDE_EDIT_TIME: 'int|true',
    GUIDE_ADD_IP: 'string|false',
    GUIDE_EDIT_IP: 'string|false',
    GUIDE_CMS_STATE: 'string|false|default=|comment=draft/published/offline/deleted',
    GUIDE_PUBLISH_TIME: 'int|false|default=0',
    GUIDE_DELETED: 'bool|false|default=false',
    GUIDE_DELETED_TIME: 'int|false|default=0',
    GUIDE_EDIT_ADMIN: 'string|false',
    GUIDE_REVISION: 'int|false|default=0',

};

// 字段前缀
GuideModel.FIELD_PREFIX = "GUIDE_";

/**
 * 状态 0=未启用,1=使用中
 */
GuideModel.STATUS = {
    UNUSE: 0,
    COMM: 1
};



module.exports = GuideModel;

/**
 * Notes:  相册实体
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2022-06-05 19:20:00 
 */


const BaseProjectModel = require('./base_project_model.js');

class AlbumModel extends BaseProjectModel {

}

// 集合名
AlbumModel.CL = BaseProjectModel.C('album');

AlbumModel.DB_STRUCTURE = {
    _id: 'string|false',
    ALBUM_DEMO: 'bool|false|default=false',
    ALBUM_DURATION: 'string|false|default=',
    ALBUM_ROUTE: 'array|false|default=[]',
    ALBUM_DRAFT: 'object|false|default={}',
    _pid: 'string|true',
    ALBUM_ID: 'string|true',

    ALBUM_TITLE: 'string|true|comment=标题', 
    ALBUM_STATUS: 'int|true|default=1|comment=状态 0=未启用,1=使用中',

    ALBUM_CATE_ID: 'string|true|default=0|comment=分类',
    ALBUM_CATE_NAME: 'string|false|comment=分类名冗余',

    ALBUM_ORDER: 'int|true|default=9999',
    ALBUM_VOUCH: 'int|true|default=0',

    ALBUM_FORMS: 'array|true|default=[]',
    ALBUM_OBJ: 'object|true|default={}',

	ALBUM_QR: 'string|false',
    ALBUM_VIEW_CNT: 'int|true|default=0',

    ALBUM_ADD_TIME: 'int|true',
    ALBUM_EDIT_TIME: 'int|true',
    ALBUM_ADD_IP: 'string|false',
    ALBUM_EDIT_IP: 'string|false',
    ALBUM_CMS_STATE: 'string|false|default=|comment=draft/published/offline/deleted',
    ALBUM_PUBLISH_TIME: 'int|false|default=0',
    ALBUM_DELETED: 'bool|false|default=false',
    ALBUM_DELETED_TIME: 'int|false|default=0',
    ALBUM_EDIT_ADMIN: 'string|false',
    ALBUM_REVISION: 'int|false|default=0',

};

// 字段前缀
AlbumModel.FIELD_PREFIX = "ALBUM_";

/**
 * 状态 0=未启用,1=使用中 
 */
AlbumModel.STATUS = {
    UNUSE: 0,
    COMM: 1
};



module.exports = AlbumModel;
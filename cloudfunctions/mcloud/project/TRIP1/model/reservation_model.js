/**
 * Notes: 预约实体
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2020-12-07 19:20:00
 */


const BaseProjectModel = require('./base_project_model.js');

class ReservationModel extends BaseProjectModel {

}

// 集合名
ReservationModel.CL = BaseProjectModel.C('reservation');

ReservationModel.DB_STRUCTURE = {
	_pid: 'string|true',
	RESERVATION_ID: 'string|true',
	RESERVATION_ADMIN_ID: 'string|true|comment=添加的管理员',
	RESERVATION_TITLE: 'string|true|comment=标题',

	RESERVATION_CONTENT: 'array|true|default=[]|comment=详细介绍',

	RESERVATION_DAYS: 'array|true|default=[]|comment=最近一次修改保存的可用日期',

	RESERVATION_TYPE_ID: 'string|true|comment=分类编号',
	RESERVATION_TYPE_NAME: 'string|true|comment=分类冗余',

	RESERVATION_IS_SHOW_LIMIT: 'int|true|default=1|comment=是否显示可预约人数',

	RESERVATION_STYLE_SET: 'object|true|default={}|comment=样式设置',

	RESERVATION_FORM_SET: 'array|true|default=[]|comment=表单字段设置',


	RESERVATION_STATUS: 'int|true|default=1|comment=状态 0=未启用,1=使用中,9=停止预约,10=已关闭',
	RESERVATION_ORDER: 'int|true|default=9999',
	RESERVATION_VOUCH: 'int|true|default=0',

	RESERVATION_QR: 'string|false',

	RESERVATION_ADD_TIME: 'int|true',
	RESERVATION_EDIT_TIME: 'int|true',
	RESERVATION_ADD_IP: 'string|false',
	RESERVATION_EDIT_IP: 'string|false',
};

// 字段前缀
ReservationModel.FIELD_PREFIX = "RESERVATION_";

/**
 * 状态 0=未启用,1=使用中,9=停止预约,10=已关闭
 */
ReservationModel.STATUS = {
	UNUSE: 0,
	COMM: 1,
	OVER: 9,
	CLOSE: 10
};

ReservationModel.STATUS_DESC = {
	UNUSE: '未启用',
	COMM: '使用中',
	OVER: '停止预约(可见)',
	CLOSE: '已关闭(不可见)'
};



module.exports = ReservationModel;

/**
 * Notes: 报名实体
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2021-12-30 19:20:00
 */


const BaseProjectModel = require('./base_project_model.js');

class BookingModel extends BaseProjectModel {

}

// 集合名
BookingModel.CL = BaseProjectModel.C('booking');

BookingModel.DB_STRUCTURE = {
	_pid: 'string|true',
	BOOKING_ID: 'string|true',

	BOOKING_EDIT_ADMIN_ID: 'string|false|comment=最近修改的管理员ID',
	BOOKING_EDIT_ADMIN_NAME: 'string|false|comment=最近修改的管理员名',
	BOOKING_EDIT_ADMIN_TIME: 'int|true|default=0|comment=管理员最近修改的时间',
	BOOKING_EDIT_ADMIN_STATUS: 'int|false|comment=最近管理员修改为的状态 ',

	BOOKING_IS_ADMIN: 'int|true|default=0|comment=是否管理员添加 0/1',

	BOOKING_CODE: 'string|true|comment=核验码15位',
	BOOKING_IS_CHECKIN: 'int|true|default=0|comment=是否签到 0/1 ',

	BOOKING_USER_ID: 'string|true|comment=用户ID',
	BOOKING_RESERVATION_ID: 'string|true|comment=预约PK',
	BOOKING_RESERVATION_TITLE: 'string|true|comment=项目',
	BOOKING_RESERVATION_DAY: 'string|true|comment=日期',
	BOOKING_RESERVATION_TIME_START: 'string|true|comment=时段开始',
	BOOKING_RESERVATION_TIME_END: 'string|true|comment=时段结束',
	BOOKING_RESERVATION_TIME_MARK: 'string|true|comment=时段标识',

	BOOKING_START_TIME: 'int|true|comment=开始时间戳',

	BOOKING_FORMS: 'array|true|default=[]|comment=表单',
	/* title:
	   mark:
	   type:
	   val:
	*/

	BOOKING_STATUS: 'int|true|default=1|comment=状态 1=预约成功,10=已取消, 99=系统取消',

	BOOKING_REASON: 'string|false|comment=审核拒绝或者取消理由',

	BOOKING_ADD_TIME: 'int|true',
	BOOKING_EDIT_TIME: 'int|true',
	BOOKING_ADD_IP: 'string|false',
	BOOKING_EDIT_IP: 'string|false',
};

// 字段前缀
BookingModel.FIELD_PREFIX = "BOOKING_";

/**
 * 状态 1=预约成功,10=已取消, 99=后台取消
 */
BookingModel.STATUS = {
	SUCC: 1,
	CANCEL: 10,
	ADMIN_CANCEL: 99
};

BookingModel.STATUS_DESC = {
	SUCC: '预约成功',
	CANCEL: '已取消',
	ADMIN_CANCEL: '系统取消',
};



module.exports = BookingModel;

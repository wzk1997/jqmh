/**
 * Notes: 预约日期设置实体
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2021-01-25 19:20:00 
 */


const BaseProjectModel = require('./base_project_model.js');

class ReservationDayModel extends BaseProjectModel {

}

// 集合名
ReservationDayModel.CL = BaseProjectModel.C('reservation_day');

ReservationDayModel.DB_STRUCTURE = {
	_pid: 'string|true',
	RESERVATION_DAY_ID: 'string|true',
	RESERVATION_DAY_RESERVATION_ID: 'string|true',

	day: 'string|true|comment=日期 yyyy-mm-dd',
	dayDesc: 'string|true|comment=描述',
	times: 'array|true|comment=具体时间段',
	/*
		{
			1. mark=唯一性标识,
			2. start=开始时间点hh:mm ～,  
			3. end=结束时间点hh:mm, 
			4. isLimit=是否人数限制, 
			5. limit=报名上限,  
			6. status=状态 0/1
			7. stat:{ //统计数据 
				succCnt=1预约成功*, 
				cancelCnt=10已取消, 
				adminCancelCnt=99后台取消
			}
		}', 
	*/

	RESERVATION_DAY_ADD_TIME: 'int|true',
	RESERVATION_DAY_EDIT_TIME: 'int|true',
	RESERVATION_DAY_ADD_IP: 'string|false',
	RESERVATION_DAY_EDIT_IP: 'string|false',
};

// 字段前缀
ReservationDayModel.FIELD_PREFIX = "RESERVATION_DAY_";



module.exports = ReservationDayModel;
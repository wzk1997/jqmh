/**
 * Notes: 预约模块控制器
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2021-12-10 04:00:00 
 */

const BaseProjectController = require('./base_project_controller.js');
const ReservationService = require('../service/reservation_service.js');
const timeUtil = require('../../../framework/utils/time_util.js');
const BookingModel = require('../model/booking_model.js');

class ReservationController extends BaseProjectController {


	// 把列表转换为显示模式
	transReservationList(list) {
		let ret = [];
		for (let k = 0; k < list.length; k++) {
			let node = {};
			node.type = 'reservation';
			node.id = list[k]._id;
			node.title = list[k].RESERVATION_TITLE;
			node.desc = list[k].RESERVATION_STYLE_SET.desc;
			node.ext = list[k].openRule;
			node.pic = list[k].RESERVATION_STYLE_SET.pic;
			ret.push(node);
		}
		return ret;
	}


	/** 按天获取预约项目 */
	async getReservationListByDay() {

		// 数据校验
		let rules = {
			day: 'must|date|name=日期',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new ReservationService();
		let list = await service.getReservationListByDay(input.day);
		return list;


	}

	/** 获取从某天开始可预约的日期 */
	async getHasDaysFromDay() {

		// 数据校验
		let rules = {
			day: 'must|date|name=日期',
		};

		// 取得数据
		let input = this.validateData(rules);


		let service = new ReservationService();
		let list = await service.getHasDaysFromDay(input.day);
		return list;

	}

	/** 预约列表 */
	async getReservationList() {

		// 数据校验
		let rules = {
			search: 'string|min:1|max:30|name=搜索条件',
			sortType: 'string|name=搜索类型',
			sortVal: 'name=搜索类型值',
			orderBy: 'object|name=排序',
			typeId: 'string',
			page: 'must|int|default=1',
			size: 'int',
			isTotal: 'bool',
			oldTotal: 'int',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new ReservationService();
		let result = await service.getReservationList(input);

		// 数据格式化
		let list = result.list;

		for (let k = 0; k < list.length; k++) {
			list[k].openRule = this._getLeaveDay(list[k].RESERVATION_DAYS) + '天可预约';
		}

		result.list = this.transReservationList(list);

		return result;

	}

	/** 我的预约列表 */
	async getMyJoinList() {

		// 数据校验
		let rules = {
			search: 'string|min:1|max:30|name=搜索条件',
			sortType: 'string|name=搜索类型',
			sortVal: 'name=搜索类型值',
			orderBy: 'object|name=排序',
			page: 'must|int|default=1',
			size: 'int',
			isTotal: 'bool',
			oldTotal: 'int',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new ReservationService();
		let result = await service.getMyJoinList(this._userId, input);

		// 数据格式化
		let list = result.list;

		let now = timeUtil.time('Y-M-D h:m');

		for (let k = 0; k < list.length; k++) {
			if (now > (list[k].BOOKING_RESERVATION_DAY + ' ' + list[k].BOOKING_RESERVATION_TIME_END))
				list[k].isTimeout = 1;
			else
				list[k].isTimeout = 0;

			list[k].BOOKING_RESERVATION_DAY = timeUtil.fmtDateCHN(list[k].BOOKING_RESERVATION_DAY) + ' (' + timeUtil.week(list[k].BOOKING_RESERVATION_DAY) + ')';

			list[k].BOOKING_ADD_TIME = timeUtil.timestamp2Time(list[k].BOOKING_ADD_TIME, 'Y-M-D h:m');
		}

		result.list = list;

		return result;

	}

	/** 我的某日预约列表 */
	async getMyJoinSomeday() {
		// 数据校验
		let rules = {
			day: 'must|date|name=日期',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new ReservationService();
		let list = await service.getMyJoinSomeday(this._userId, input.day);

		// 数据格式化  
		for (let k = 0; k < list.length; k++) {

		}

		return list;

	}

	/** 我的预约详情 */
	async getMyJoinDetail() {
		// 数据校验
		let rules = {
			joinId: 'must|id',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new ReservationService();
		let join = await service.getMyJoinDetail(this._userId, input.joinId);
		if (join) {
			join.BOOKING_STATUS_DESC = BookingModel.getDesc('STATUS', join.BOOKING_STATUS);
			join.BOOKING_ADD_TIME = timeUtil.timestamp2Time(join.BOOKING_ADD_TIME);
		}
		return join;

	}

	/** 用户预约取消 */
	async cancelMyJoin() {

		// 数据校验
		let rules = {
			joinId: 'must|id',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new ReservationService();
		return await service.cancelMyJoin(this._userId, input.joinId);
	}

	/** 用户自助签到 */
	async userSelfCheckin() {

		// 数据校验
		let rules = {
			timeMark: 'must|string',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new ReservationService();
		return await service.userSelfCheckin(this._userId, input.timeMark);
	}


	/**  预约前获取关键信息 */
	async detailForJoin() {
		// 数据校验
		let rules = {
			reservationId: 'must|reservationId',
			timeMark: 'must|string',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new ReservationService();
		let reservation = await service.detailForJoin(this._userId, input.reservationId, input.timeMark);

		if (reservation) {
			// 显示转换  
		}

		return reservation;
	}

	/** 浏览预约信息 */
	async viewReservation() {
		// 数据校验
		let rules = {
			id: 'must|id',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new ReservationService();
		let reservation = await service.viewReservation(input.id);

		if (reservation) {
			// 显示转换  
		}

		return reservation;
	}

	/** 预约前检测 */
	async beforeJoin() {
		// 数据校验
		let rules = {
			reservationId: 'must|id',
			timeMark: 'must|string',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new ReservationService();
		return await service.beforeJoin(this._userId, input.reservationId, input.timeMark);
	}

	/** 预约提交 */
	async join() {
		// 数据校验
		let rules = {
			reservationId: 'must|id',
			timeMark: 'must|string',
			forms: 'must|array',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new ReservationService();
		return await service.join(this._userId, input.reservationId, input.timeMark, input.forms);
	}


	// 计算可约天数
	_getLeaveDay(days) {
		let now = timeUtil.time('Y-M-D');
		let count = 0;
		for (let k = 0; k < days.length; k++) {
			if (days[k] >= now) count++;
		}
		return count;
	}

}

module.exports = ReservationController;
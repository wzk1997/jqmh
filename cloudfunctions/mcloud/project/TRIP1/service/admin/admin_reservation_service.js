/**
 * Notes: 预约后台管理
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2021-12-08 07:48:00 
 */

const BaseProjectAdminService = require('./base_project_admin_service.js');
const ReservationService = require('../reservation_service.js');
const AdminHomeService = require('../admin/admin_home_service.js');
const dataUtil = require('../../../../framework/utils/data_util.js');
const timeUtil = require('../../../../framework/utils/time_util.js');
const setupUtil = require('../../../../framework/utils/setup/setup_util.js');
const util = require('../../../../framework/utils/util.js');
const cloudUtil = require('../../../../framework/cloud/cloud_util.js');
const cloudBase = require('../../../../framework/cloud/cloud_base.js');

const ReservationModel = require('../../model/reservation_model.js');
const BookingModel = require('../../model/booking_model.js');
const ReservationDayModel = require('../../model/reservation_day_model.js');

const exportUtil = require('../../../../framework/utils/export_util.js');

const SETUP_RESERVATION_TEMP_KEY = 'SETUP_RESERVATION_TEMP';

// 导出报名数据KEY
const EXPORT_BOOKING_DATA_KEY = 'EXPORT_BOOKING_DATA';

class AdminReservationService extends BaseProjectAdminService {

	/** 推荐首页SETUP */
	async vouchReservationSetup(id, vouch) {
		this.AppError('该功能暂不开放，如有需要请加作者微信：cclinux0730');
	}


	/** 预约数据列表 */
	async getDayList(reservationId, start, end) {
		let where = {
			RESERVATION_DAY_RESERVATION_ID: reservationId,
			day: ['between', start, end]
		}
		let orderBy = {
			day: 'asc'
		}
		return await ReservationDayModel.getAllBig(where, 'day,times,dayDesc', orderBy);
	}

	// 按项目统计人数
	async statJoinCntByReservation(reservationId) {
		let today = timeUtil.time('Y-M-D');
		let where = {
			day: ['>=', today],
			RESERVATION_DAY_RESERVATION_ID: reservationId
		}

		let reservationService = new ReservationService();
		let list = await ReservationDayModel.getAllBig(where, 'RESERVATION_DAY_RESERVATION_ID,times', {}, 1000);
		for (let k = 0; k < list.length; k++) {
			let reservationId = list[k].RESERVATION_DAY_RESERVATION_ID;
			let times = list[k].times;

			for (let j in times) {
				let timeMark = times[j].mark;
				reservationService.statJoinCnt(reservationId, timeMark);
			}
		}
	}

	/** 自助签到码 */
	async genSelfCheckinQr(page, timeMark) {
		this.AppError('该功能暂不开放，如有需要请加作者微信：cclinux0730');
	}

	/** 管理员按钮核销 */
	async checkinJoin(joinId, flag) {
		this.AppError('该功能暂不开放，如有需要请加作者微信：cclinux0730');
	}

	/** 管理员扫码核销 */
	async scanJoin(reservationId, code) {
		this.AppError('该功能暂不开放，如有需要请加作者微信：cclinux0730');
	}

	/**
	 * 判断本日是否有预约记录
	 * @param {*} daySet daysSet的节点
	 */
	checkHasJoinCnt(times) {
		if (!times) return false;
		for (let k = 0; k < times.length; k++) {
			if (times[k].stat.succCnt) return true;
		}
		return false;
	}

	// 判断含有预约的日期
	getCanModifyDaysSet(daysSet) {
		let now = timeUtil.time('Y-M-D');

		for (let k = 0; k < daysSet.length; k++) {
			if (daysSet[k].day < now) continue;
			daysSet[k].hasJoin = this.checkHasJoinCnt(daysSet[k].times);
		}

		return daysSet;
	}

	/** 取消某个时间段的所有预约记录 */
	async cancelJoinByTimeMark(admin, reservationId, timeMark, reason) {
		this.AppError('该功能暂不开放，如有需要请加作者微信：cclinux0730');

	}


	/**添加 */
	async insertReservation(adminId, {
		title,
		order,
		typeId,
		typeName,
		daysSet,
		isShowLimit,
		formSet,
	}) {

		this.AppError('该功能暂不开放，如有需要请加作者微信：cclinux0730');
	}

	/**删除数据 */
	async delReservation(id) {
		this.AppError('该功能暂不开放，如有需要请加作者微信：cclinux0730');
	}

	/**获取信息 */
	async getReservationDetail(id) {
		let fields = '*';

		let where = {
			_id: id
		}
		let reservation = await ReservationModel.getOne(where, fields);
		if (!reservation) return null;

		let reservationService = new ReservationService();
		reservation.RESERVATION_DAYS_SET = await reservationService.getDaysSet(id, timeUtil.time('Y-M-D')); //今天及以后

		return reservation;
	}

	/**
	 * 更新富文本详细的内容及图片信息
	 * @returns 返回 urls数组 [url1, url2, url3, ...]
	 */
	async updateReservationContent({
		id,
		content // 富文本数组
	}) {

		this.AppError('该功能暂不开放，如有需要请加作者微信：cclinux0730');

	}

	/**
	 * 更新封面内容及图片信息
	 * @returns 返回 urls数组 [url1, url2, url3, ...]
	 */
	async updateReservationStyleSet({
		reservationId,
		styleSet
	}) {

		this.AppError('该功能暂不开放，如有需要请加作者微信：cclinux0730');

	}

	/** 更新日期设置 */
	async _editDays(reservationId, nowDay, daysSetData) {
		// 删除指定日期之后的记录（含)
		this.AppError('该功能暂不开放，如有需要请加作者微信：cclinux0730');
	}

	/**更新数据 */
	async editReservation({
		id,
		title,
		typeId,
		typeName,
		order,
		daysSet,
		isShowLimit,
		formSet
	}) {
		this.AppError('该功能暂不开放，如有需要请加作者微信：cclinux0730');

	}

	/**预约名单分页列表 */
	async getJoinList({
		search, // 搜索条件
		sortType, // 搜索菜单
		sortVal, // 搜索菜单
		orderBy, // 排序
		reservationId,
		mark,
		page,
		size,
		isTotal = true,
		oldTotal
	}) {

		orderBy = orderBy || {
			'BOOKING_EDIT_TIME': 'desc'
		};
		let fields = 'BOOKING_IS_CHECKIN,BOOKING_CODE,BOOKING_ID,BOOKING_REASON,BOOKING_USER_ID,BOOKING_RESERVATION_ID,BOOKING_RESERVATION_TITLE,BOOKING_RESERVATION_DAY,BOOKING_RESERVATION_TIME_START,BOOKING_RESERVATION_TIME_END,BOOKING_RESERVATION_TIME_MARK,BOOKING_FORMS,BOOKING_STATUS,BOOKING_EDIT_TIME';

		let where = {
			BOOKING_RESERVATION_ID: reservationId,
			BOOKING_RESERVATION_TIME_MARK: mark
		};
		if (util.isDefined(search) && search) {
			where['BOOKING_FORMS.val'] = {
				$regex: '.*' + search,
				$options: 'i'
			};
		} else if (sortType && util.isDefined(sortVal)) {
			// 搜索菜单
			switch (sortType) {
				case 'status':
					// 按类型
					sortVal = Number(sortVal);
					if (sortVal == 1099) //取消的2种
						where.BOOKING_STATUS = ['in', [10, 99]]
					else
						where.BOOKING_STATUS = Number(sortVal);
					break;
				case 'checkin':
					// 签到
					where.BOOKING_STATUS = BookingModel.STATUS.SUCC;
					if (sortVal == 1) {
						where.BOOKING_IS_CHECKIN = 1;
					} else {
						where.BOOKING_IS_CHECKIN = 0;
					}
					break;
			}
		}

		return await BookingModel.getList(where, fields, orderBy, page, size, isTotal, oldTotal);
	}

	/**预约项目分页列表 */
	async getAdminReservationList({
		search, // 搜索条件
		sortType, // 搜索菜单
		sortVal, // 搜索菜单
		orderBy, // 排序
		whereEx, //附加查询条件
		page,
		size,
		isTotal = true,
		oldTotal
	}) {

		orderBy = orderBy || {
			'RESERVATION_ORDER': 'asc',
			'RESERVATION_ADD_TIME': 'desc'
		};
		let fields = 'RESERVATION_TYPE,RESERVATION_TYPE_NAME,RESERVATION_TITLE,RESERVATION_STATUS,RESERVATION_DAYS,RESERVATION_ADD_TIME,RESERVATION_EDIT_TIME,RESERVATION_ORDER,RESERVATION_VOUCH,RESERVATION_QR';

		let where = {};
		if (util.isDefined(search) && search) {
			where.RESERVATION_TITLE = {
				$regex: '.*' + search,
				$options: 'i'
			};
		} else if (sortType && util.isDefined(sortVal)) {
			// 搜索菜单
			switch (sortType) {
				case 'status':
					// 按类型
					where.RESERVATION_STATUS = Number(sortVal);
					break;
				case 'typeId':
					// 按类型
					where.RESERVATION_TYPE_ID = sortVal;
					break;
				case 'sort':
					// 排序
					if (sortVal == 'view') {
						orderBy = {
							'RESERVATION_VIEW_CNT': 'desc',
							'RESERVATION_ADD_TIME': 'desc'
						};
					}

					break;
			}
		}

		return await ReservationModel.getList(where, fields, orderBy, page, size, isTotal, oldTotal);
	}

	/** 删除 */
	async delJoin(joinId) {
		this.AppError('该功能暂不开放，如有需要请加作者微信：cclinux0730');

	}

	/**修改报名状态 
	 * 特殊约定 99=>正常取消 
	 */
	async statusJoin(admin, joinId, status, reason = '') {
		this.AppError('该功能暂不开放，如有需要请加作者微信：cclinux0730');
	}

	/**修改项目状态 */
	async statusReservation(id, status) {
		this.AppError('该功能暂不开放，如有需要请加作者微信：cclinux0730');
	}

	/**置顶排序设定 */
	async sortReservation(id, sort) {
		this.AppError('该功能暂不开放，如有需要请加作者微信：cclinux0730');
	}

	/**首页设定 */
	async vouchReservation(id, vouch) {
		this.AppError('该功能暂不开放，如有需要请加作者微信：cclinux0730');
	}

	//##################模板
	/**添加模板 */
	async insertReservationTemp({
		name,
		times,
	}) {

		this.AppError('该功能暂不开放，如有需要请加作者微信：cclinux0730');

	}

	/**更新数据 */
	async editReservationTemp({
		id,
		limit,
		isLimit
	}) {

		this.AppError('该功能暂不开放，如有需要请加作者微信：cclinux0730');
	}


	/**删除数据 */
	async delReservationTemp(id) {
		this.AppError('该功能暂不开放，如有需要请加作者微信：cclinux0730');

	}


	/**模板列表 */
	async getReservationTempList() {
		let list = await setupUtil.get(SETUP_RESERVATION_TEMP_KEY);
		if (!list || !Array.isArray(list)) list = [];
		return list;
	}

	// #####################导出报名数据
	/**获取报名数据 */
	async getJoinDataURL() {
		return await exportUtil.getExportDataURL(EXPORT_BOOKING_DATA_KEY);
	}

	/**删除报名数据 */
	async deleteJoinDataExcel() {
		return await exportUtil.deleteDataExcel(EXPORT_BOOKING_DATA_KEY);
	}

	/**导出报名数据 */
	async exportJoinDataExcel({
		reservationId,
		startDay,
		endDay,
		status
	}) {
		this.AppError('该功能暂不开放，如有需要请加作者微信：cclinux0730');

	}

}

module.exports = AdminReservationService;
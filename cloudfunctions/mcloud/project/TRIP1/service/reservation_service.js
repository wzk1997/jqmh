/**
 * Notes: 预约模块业务逻辑
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2021-12-10 07:48:00
 */

const BaseProjectService = require('./base_project_service.js');
const util = require('../../../framework/utils/util.js');
const ReservationModel = require('../model/reservation_model.js');
const BookingModel = require('../model/booking_model.js');
const ReservationDayModel = require('../model/reservation_day_model.js');
const LogUtil = require('../../../framework/utils/log_util.js');
const timeUtil = require('../../../framework/utils/time_util.js');
const dataUtil = require('../../../framework/utils/data_util.js');
const projectConfig = require('../public/project_config.js');
const RESERVATION_LOG_LEVEL = 'debug';

class ReservationService extends BaseProjectService {

	constructor() {
		super();
		this._log = new LogUtil(projectConfig.RESERVATION_LOG_LEVEL);
	}

	/**
	 * 抛出异常
	 * @param {*} msg
	 * @param {*} code
	 */
	AppError(msg) {
		this._log.error(msg);
		super.AppError(msg);
	}

	_reservationLog(reservation, func = '', msg = '') {
		let str = '';
		str = `[RESERVATION=${reservation.RESERVATION_TITLE}][${func}] ${msg}`;
		this._log.debug(str);
	}

	/** 统一获取Reservation（某天) */
	async getReservationOneDay(reservationId, day, where, fields = '*') {

		let reservation = await ReservationModel.getOne(where, fields);
		if (!reservation) return reservation;

		reservation.RESERVATION_DAYS_SET = await this.getDaysSet(reservationId, day, day);
		return reservation;
	}

	/** 获取日期设置 */
	async getDaysSet(reservationId, startDay, endDay = null) {
		let where = {
			RESERVATION_DAY_RESERVATION_ID: reservationId
		}
		if (startDay && endDay && endDay == startDay)
			where.day = startDay;
		else if (startDay && endDay)
			where.day = ['between', startDay, endDay];
		else if (!startDay && endDay)
			where.day = ['<=', endDay];
		else if (startDay && !endDay)
			where.day = ['>=', startDay];

		let orderBy = {
			'day': 'asc'
		}
		let list = await ReservationDayModel.getAllBig(where, 'day,dayDesc,times', orderBy, 1000);

		for (let k = 0; k < list.length; k++) {
			delete list[k]._id;
		}

		return list;
	}

	// 按时段统计某时段报名情况
	async statJoinCnt(reservationId, timeMark) {
		let whereJoin = {
			BOOKING_RESERVATION_TIME_MARK: timeMark,
			BOOKING_RESERVATION_ID: reservationId
		};
		let ret = await BookingModel.groupCount(whereJoin, 'BOOKING_STATUS');

		let stat = { //统计数据
			succCnt: ret['BOOKING_STATUS_1'] || 0, //1=预约成功,
			cancelCnt: ret['BOOKING_STATUS_10'] || 0, //10=已取消,
			adminCancelCnt: ret['BOOKING_STATUS_99'] || 0, //99=后台取消
		};

		let whereDay = {
			RESERVATION_DAY_RESERVATION_ID: reservationId,
			day: this.getDayByTimeMark(timeMark)
		};
		let day = await ReservationDayModel.getOne(whereDay, 'times');
		if (!day) return;

		let times = day.times;
		for (let j in times) {
			if (times[j].mark === timeMark) {
				let data = {
					['times.' + j + '.stat']: stat
				}
				await ReservationDayModel.edit(whereDay, data);
				return;
			}
		}

	}


	// 预约前检测
	async beforeJoin(userId, reservationId, timeMark) {
		await this.checkReservationRules(userId, reservationId, timeMark);
	}

	// 预约逻辑
	async join(userId, reservationId, timeMark, forms) {
		// 预约时段是否存在
		let reservationWhere = {
			_id: reservationId
		};
		let day = this.getDayByTimeMark(timeMark);
		let reservation = await this.getReservationOneDay(reservationId, day, reservationWhere);

		if (!reservation) {
			this.AppError('预约时段选择错误1，请重新选择');
		}

		let daySet = this.getDaySetByTimeMark(reservation, timeMark);
		if (!daySet)
			this.AppError('预约时段选择错误2，请重新选择');

		let timeSet = this.getTimeSetByTimeMark(reservation, timeMark);
		if (!timeSet)
			this.AppError('预约时段选择错误3，请重新选择');

		// 规则校验
		await this.checkReservationRules(userId, reservationId, timeMark);


		let data = {};

		data.BOOKING_USER_ID = userId;

		data.BOOKING_RESERVATION_ID = reservationId;
		data.BOOKING_RESERVATION_TITLE = reservation.RESERVATION_TITLE;
		data.BOOKING_RESERVATION_DAY = daySet.day;
		data.BOOKING_RESERVATION_TIME_START = timeSet.start;
		data.BOOKING_RESERVATION_TIME_END = timeSet.end;
		data.BOOKING_RESERVATION_TIME_MARK = timeMark;

		data.BOOKING_START_TIME = timeUtil.time2Timestamp(daySet.day + ' ' + timeSet.start + ':00');

		data.BOOKING_FORMS = forms;

		data.BOOKING_STATUS = BookingModel.STATUS.SUCC;
		data.BOOKING_CODE = dataUtil.genRandomIntString(15);

		// 入库
		let joinId = await BookingModel.insert(data);

		// 若有手机号码 用户入库
		let mobile = '';
		let userName = '';
		for (let k = 0; k < forms.length; k++) {
			if (!mobile && forms[k].type == 'mobile') {
				mobile = forms[k].val;
				continue;
			} else if (!userName && forms[k].title == '姓名') {
				userName = forms[k].val;
				continue;
			}
		}

		// 统计
		this.statJoinCnt(reservationId, timeMark);

		return {
			result: 'ok',
			joinId
		}
	}

	// 根据日期获取其所在天设置
	getDaySetByDay(reservation, day) {
		for (let k = 0; k < reservation.RESERVATION_DAYS_SET.length; k++) {
			if (reservation.RESERVATION_DAYS_SET[k].day == day)
				return dataUtil.deepClone(reservation.RESERVATION_DAYS_SET[k]);
		}
		return null;
	}

	// 根据时段标识获取其所在天
	getDayByTimeMark(timeMark) {
		return timeMark.substr(1, 4) + '-' + timeMark.substr(5, 2) + '-' + timeMark.substr(7, 2);
	}

	// 根据时段标识获取其所在天设置
	getDaySetByTimeMark(reservation, timeMark) {
		let day = this.getDayByTimeMark(timeMark);

		for (let k = 0; k < reservation.RESERVATION_DAYS_SET.length; k++) {
			if (reservation.RESERVATION_DAYS_SET[k].day == day)
				return dataUtil.deepClone(reservation.RESERVATION_DAYS_SET[k]);
		}
		return null;
	}

	// 根据时段标识获取其所在时段设置
	getTimeSetByTimeMark(reservation, timeMark) {
		let day = this.getDayByTimeMark(timeMark);

		for (let k = 0; k < reservation.RESERVATION_DAYS_SET.length; k++) {
			if (reservation.RESERVATION_DAYS_SET[k].day != day) continue;

			for (let j in reservation.RESERVATION_DAYS_SET[k].times) {
				if (reservation.RESERVATION_DAYS_SET[k].times[j].mark == timeMark)
					return dataUtil.deepClone(reservation.RESERVATION_DAYS_SET[k].times[j]);
			}
		}
		return null;
	}

	// 预约时段人数和状态控制校验
	async checkReservationTimeControll(reservation, timeMark) {
		if (!reservation) this.AppError('预约时段设置错误, 预约项目不存在');

		let daySet = this.getDaySetByTimeMark(reservation, timeMark); // 当天设置
		let timeSet = this.getTimeSetByTimeMark(reservation, timeMark); // 预约时段设置

		if (!daySet || !timeSet) this.AppError('预约时段设置错误day&time');

		let statusDesc = timeSet.status == 1 ? '开启' : '关闭';
		let limitDesc = '';
		if (timeSet.isLimit) {
			limitDesc = '人数上限MAX=' + timeSet.limit;
		} else
			limitDesc = '人数不限制NO';

		this._reservationLog(reservation, `------------------------------`);
		this._reservationLog(reservation, `#预约时段控制,预约日期=<${daySet.day}>`, `预约时段=[${timeSet.start}-${timeSet.end}],状态=${statusDesc}, ${limitDesc} 当前预约成功人数=${timeSet.stat.succCnt}`);

		if (timeSet.status == 0) this.AppError('该时段预约已经关闭，请选择其他');

		// 时段总人数限制
		if (timeSet.isLimit) {
			if (timeSet.stat.succCnt >= timeSet.limit) {
				this.AppError('该时段预约人员已满，请选择其他');
			}
		}
	}


	/** 报名规则校验 */
	async checkReservationRules(userId, reservationId, timeMark) {
		// 预约时段是否存在
		let reservationWhere = {
			_id: reservationId
		};
		let day = this.getDayByTimeMark(timeMark);
		let reservation = await this.getReservationOneDay(reservationId, day, reservationWhere);
		if (!reservation) {
			this.AppError('预约时段选择错误，请重新选择');
		}

		// 预约时段人数和状态控制校验
		await this.checkReservationTimeControll(reservation, timeMark);

		// 截止规则
		await this.checkReservationEndSet(reservation, timeMark);

		// 针对用户的次数限制
		await this.checkReservationLimitSet(userId, reservation, timeMark);

	}


	// 预约次数限制校验
	async checkReservationLimitSet(userId, reservation, timeMark) {
		if (!reservation) this.AppError('预约次数规则错误, 预约项目不存在');
		let reservationId = reservation._id;

		let daySet = this.getDaySetByTimeMark(reservation, timeMark); // 当天设置
		let timeSet = this.getTimeSetByTimeMark(reservation, timeMark); // 预约时段设置

		this._reservationLog(reservation, `------------------------------`);
		this._reservationLog(reservation, `#预约次数规则,预约日期=<${daySet.day}>`, `预约时段=[${timeSet.start}～${timeSet.end}]`);

		let where = {
			BOOKING_RESERVATION_ID: reservationId,
			BOOKING_RESERVATION_TIME_MARK: timeMark,
			BOOKING_USER_ID: userId,
			BOOKING_STATUS: BookingModel.STATUS.SUCC
		}
		let cnt = await BookingModel.count(where);
		this._reservationLog(reservation, `预约次数规则,mode=本时段可预约1次`, `当前已预约=${cnt}次`);
		if (cnt >= 1) {
			this.AppError(`您本时段已经预约，无须重复预约`);
		}
	}



	// 预约截止设置校验
	async checkReservationEndSet(reservation, timeMark) {
		if (!reservation) this.AppError('预约截止规则错误, 预约项目不存在');


		this._reservationLog(reservation, `------------------------------`);
		let daySet = this.getDaySetByTimeMark(reservation, timeMark); // 当天设置
		let timeSet = this.getTimeSetByTimeMark(reservation, timeMark); // 预约时段设置

		this._reservationLog(reservation, `#预约截止规则,预约日期=<${daySet.day}>`, `预约时段=[${timeSet.start}-${timeSet.end}]`);

		let nowTime = timeUtil.time('Y-M-D h:m:s');

		let startTime = daySet.day + ' ' + timeSet.start + ':00';
		this._reservationLog(reservation, `预约开始规则,mode=<时段过期判定>`, `预约开始时段=${startTime},当前时段=${nowTime}`);
		if (nowTime > startTime) {
			this.AppError('该时段已开始，无法预约，请选择其他');
		}

	}


	/**  预约详情 */
	async viewReservation(reservationId) {

		let fields = '*';

		let where = {
			_id: reservationId,
			RESERVATION_STATUS: ['in', [ReservationModel.STATUS.COMM, ReservationModel.STATUS.OVER]]
		}
		let reservation = await ReservationModel.getOne(where, fields);
		if (!reservation) return null;


		let getDaysSet = [];
		reservation.RESERVATION_DAYS_SET = await this.getDaysSet(reservationId, timeUtil.time('Y-M-D')); //今天及以后
		let daysSet = reservation.RESERVATION_DAYS_SET;

		let now = timeUtil.time('Y-M-D');
		for (let k = 0; k < daysSet.length; k++) {
			let dayNode = daysSet[k];

			if (dayNode.day < now) continue; // 排除过期

			let getTimes = [];

			for (let j in dayNode.times) {
				let timeNode = dayNode.times[j];

				// 排除状态关闭的时段
				if (timeNode.status != 1) continue;

				// 判断数量是否已满
				if (timeNode.isLimit && timeNode.stat.succCnt >= timeNode.limit)
					timeNode.error = '预约已满';

				// 截止规则
				if (!timeNode.error) {
					try {
						await this.checkReservationEndSet(reservation, timeNode.mark);
					} catch (ex) {
						if (ex.name == 'AppError')
							timeNode.error = '预约结束';
						else
							throw ex;
					}
				}

				getTimes.push(timeNode);
			}
			dayNode.times = getTimes;

			getDaysSet.push(dayNode);
		}

		// 只返回需要的字段
		let ret = {};
		ret.RESERVATION_DAYS_SET = getDaysSet;

		ret.RESERVATION_IS_SHOW_LIMIT = reservation.RESERVATION_IS_SHOW_LIMIT;
		ret.RESERVATION_TITLE = reservation.RESERVATION_TITLE;
		ret.RESERVATION_TYPE_NAME = reservation.RESERVATION_TYPE_NAME;
		ret.RESERVATION_CONTENT = reservation.RESERVATION_CONTENT;


		return ret;
	}

	/** 用户自助签到 */
	async userSelfCheckin(userId, timeMark) {
		let day = this.getDayByTimeMark(timeMark);

		let today = timeUtil.time('Y-M-D');
		if (day != today)
			this.AppError('仅在预约当天可以签到，当前签到码的日期是' + day);

		let whereSucc = {
			BOOKING_RESERVATION_DAY: day,
			BOOKING_RESERVATION_TIME_MARK: timeMark,
			BOOKING_USER_ID: userId,
			BOOKING_STATUS: BookingModel.STATUS.SUCC
		}
		let cntSucc = await BookingModel.count(whereSucc);

		let whereCheckin = {
			BOOKING_RESERVATION_DAY: day,
			BOOKING_RESERVATION_TIME_MARK: timeMark,
			BOOKING_USER_ID: userId,
			BOOKING_IS_CHECKIN: 1,
			BOOKING_STATUS: BookingModel.STATUS.SUCC
		}
		let cntCheckin = await BookingModel.count(whereCheckin);

		let ret = '';
		if (cntSucc == 0) {
			ret = '您没有本次报名的记录，请在「个人中心」查看详情~';
		} else if (cntSucc == cntCheckin) {
			ret = '您已签到，无须重复签到，请在「个人中心」查看详情~';
		} else {
			let where = {
				BOOKING_RESERVATION_DAY: day,
				BOOKING_RESERVATION_TIME_MARK: timeMark,
				BOOKING_USER_ID: userId,
				BOOKING_IS_CHECKIN: 0,
				BOOKING_STATUS: BookingModel.STATUS.SUCC
			}
			let data = {
				BOOKING_IS_CHECKIN: 1
			}
			await BookingModel.edit(where, data);
			ret = '签到成功，请在「个人中心」查看详情~'
		}
		return {
			ret
		};

	}


	/**  预约前获取关键信息 */
	async detailForJoin(userId, reservationId, timeMark) {

		let fields = 'RESERVATION_DAYS_SET,RESERVATION_FORM_SET, RESERVATION_TITLE';

		let where = {
			_id: reservationId,
			RESERVATION_STATUS: ['in', [ReservationModel.STATUS.COMM, ReservationModel.STATUS.OVER]]
		}
		let day = this.getDayByTimeMark(timeMark);
		let reservation = await this.getReservationOneDay(reservationId, day, where, fields);
		if (!reservation) return null;

		let dayDesc = timeUtil.fmtDateCHN(this.getDaySetByTimeMark(reservation, timeMark).day);

		let timeSet = this.getTimeSetByTimeMark(reservation, timeMark);
		let timeDesc = timeSet.start + '～' + timeSet.end;
		reservation.dayDesc = dayDesc + ' ' + timeDesc;

		// 取出本人最近一次本时段填写表单
		let whereMy = {
			BOOKING_USER_ID: userId,
			BOOKING_RESERVATION_ID: reservationId,
			BOOKING_RESERVATION_TIME_MARK: timeMark
		}
		let orderByMy = {
			BOOKING_ADD_TIME: 'desc'
		}
		let joinMy = await BookingModel.getOne(whereMy, 'BOOKING_FORMS', orderByMy);

		// 取出本人最近一次本项目填写表单
		if (!joinMy) {
			whereMy = {
				BOOKING_USER_ID: userId,
				BOOKING_RESERVATION_ID: reservationId,
			}
			let orderByMy = {
				BOOKING_ADD_TIME: 'desc'
			}
			joinMy = await BookingModel.getOne(whereMy, 'BOOKING_FORMS', orderByMy);
		}

		// 取出本人最近一次的填写表单
		if (!joinMy) {
			whereMy = {
				BOOKING_USER_ID: userId,
			}
			let orderByMy = {
				BOOKING_ADD_TIME: 'desc'
			}
			joinMy = await BookingModel.getOne(whereMy, 'BOOKING_FORMS', orderByMy);
		}

		let myForms = joinMy ? joinMy.BOOKING_FORMS : [];
		reservation.myForms = myForms;

		return reservation;
	}

	/** 获取某天可用时段 */
	async getUsefulTimesByDaysSet(reservationId, day) {
		let where = {
			RESERVATION_DAY_RESERVATION_ID: reservationId,
			day
		}
		let daysSet = await ReservationDayModel.getAll(where, 'day,times');
		let usefulTimes = [];
		for (let k = 0; k < daysSet.length; k++) {
			if (daysSet[k].day != day)
				continue;

			let times = daysSet[k].times;
			for (let j in times) {
				if (times[j].status != 1) continue;
				usefulTimes.push(times[j]);
			}
			break;

		}
		return usefulTimes;
	}

	/** 按天获取预约项目 */
	async getReservationListByDay(day) {
		let where = {
			RESERVATION_STATUS: ReservationModel.STATUS.COMM,
		};

		let orderBy = {
			'RESERVATION_ORDER': 'asc',
			'RESERVATION_ADD_TIME': 'desc'
		};

		let fields = 'RESERVATION_TITLE,RESERVATION_DAYS_SET,RESERVATION_STYLE_SET';

		let list = await ReservationModel.getAll(where, fields, orderBy);

		let retList = [];

		for (let k = 0; k < list.length; k++) {
			let usefulTimes = await this.getUsefulTimesByDaysSet(list[k]._id, day);

			if (usefulTimes.length == 0) continue;

			let node = {};
			node.timeDesc = usefulTimes.length > 1 ? usefulTimes.length + '个时段' : usefulTimes[0].start;
			node.title = list[k].RESERVATION_TITLE;
			node.pic = list[k].RESERVATION_STYLE_SET.pic;
			node._id = list[k]._id;
			retList.push(node);

		}
		return retList;
	}

	/** 获取从某天开始可预约的日期 */
	async getHasDaysFromDay(day) {
		let where = {
			day: ['>=', day],
		};

		let fields = 'times,day';
		let list = await ReservationDayModel.getAllBig(where, fields);

		let retList = [];
		for (let k = 0; k < list.length; k++) {
			for (let n in list[k].times) {
				if (list[k].times[n].status == 1) {
					retList.push(list[k].day);
					break;
				}
			}
		}
		return retList;
	}

	/** 取得预约分页列表 */
	async getReservationList({
		search, // 搜索条件
		sortType, // 搜索菜单
		sortVal, // 搜索菜单
		orderBy, // 排序
		typeId, //附加查询条件
		page,
		size,
		isTotal = true,
		oldTotal
	}) {

		orderBy = orderBy || {
			'RESERVATION_ORDER': 'asc',
			'RESERVATION_ADD_TIME': 'desc'
		};
		let fields = 'RESERVATION_TITLE,RESERVATION_STYLE_SET,RESERVATION_DAYS';

		let where = {};
		if (typeId && typeId !== '0') where.RESERVATION_TYPE_ID = typeId;
		console.log(typeId)
		where.RESERVATION_STATUS = ['in', [ReservationModel.STATUS.COMM, ReservationModel.STATUS.OVER]]; // 状态

		if (util.isDefined(search) && search) {
			where.RESERVATION_TITLE = {
				$regex: '.*' + search,
				$options: 'i'
			};
		} else if (sortType && util.isDefined(sortVal)) {
			// 搜索菜单
			switch (sortType) {
				case 'sort':
					// 排序
					if (sortVal == 'view') {
						orderBy = {
							'RESERVATION_VIEW_CNT': 'desc',
							'RESERVATION_ADD_TIME': 'desc'
						};
					}
					if (sortVal == 'new') {
						orderBy = {
							'RESERVATION_ADD_TIME': 'desc'
						};
					}

					break;
			}
		}
		let result = await ReservationModel.getList(where, fields, orderBy, page, size, isTotal, oldTotal);

		return result;
	}



	/** 取消我的预约 只有成功可以取消 */
	async cancelMyJoin(userId, joinId) {
		let where = {
			BOOKING_USER_ID: userId,
			_id: joinId,
			BOOKING_IS_CHECKIN: 0, // 签到不能取消
			BOOKING_STATUS: BookingModel.STATUS.SUCC
		};
		let join = await BookingModel.getOne(where);

		if (!join) {
			this.AppError('未找到可取消的预约记录');
		}

		// 取消规则判定
		let whereReservation = {
			_id: join.BOOKING_RESERVATION_ID,
			RESERVATION_STATUS: ['in', [ReservationModel.STATUS.COMM, ReservationModel.STATUS.OVER]]
		}
		let reservation = await this.getReservationOneDay(join.BOOKING_RESERVATION_ID, join.BOOKING_RESERVATION_DAY, whereReservation);
		if (!reservation) this.AppError('预约项目不存在或者已关闭');

		let daySet = this.getDaySetByTimeMark(reservation, join.BOOKING_RESERVATION_TIME_MARK);
		let timeSet = this.getTimeSetByTimeMark(reservation, join.BOOKING_RESERVATION_TIME_MARK);
		if (!timeSet) this.AppError('被取消的时段不存在');

		let startT = daySet.day + ' ' + timeSet.start + ':00';
		let startTime = timeUtil.time2Timestamp(startT);

		let now = timeUtil.time();

		if (now > startTime)
			this.AppError('该预约已经开始，无法取消');


		let data = {
			BOOKING_STATUS: BookingModel.STATUS.CANCEL,
			BOOKING_REASON: '',
			BOOKING_IS_CHECKIN: 0,
		}
		await BookingModel.edit(where, data);
		this.statJoinCnt(join.BOOKING_RESERVATION_ID, join.BOOKING_RESERVATION_TIME_MARK);

	}

	/** 取得我的预约详情 */
	async getMyJoinDetail(userId, joinId) {

		let fields = 'BOOKING_IS_CHECKIN,BOOKING_REASON,BOOKING_RESERVATION_ID,BOOKING_RESERVATION_TITLE,BOOKING_RESERVATION_DAY,BOOKING_RESERVATION_TIME_START,BOOKING_RESERVATION_TIME_END,BOOKING_STATUS,BOOKING_ADD_TIME,BOOKING_CODE,BOOKING_FORMS';

		let where = {
			_id: joinId,
			BOOKING_USER_ID: userId
		};
		return await BookingModel.getOne(where, fields);
	}

	/** 取得我的预约分页列表 */
	async getMyJoinList(userId, {
		search, // 搜索条件
		sortType, // 搜索菜单
		sortVal, // 搜索菜单
		orderBy, // 排序
		page,
		size,
		isTotal = true,
		oldTotal
	}) {
		orderBy = orderBy || {
			//	'BOOKING_RESERVATION_DAY': 'desc',
			//	'BOOKING_RESERVATION_TIME_START': 'desc',
			'BOOKING_ADD_TIME': 'desc'
		};
		let fields = 'BOOKING_IS_CHECKIN,BOOKING_REASON,BOOKING_RESERVATION_ID,BOOKING_RESERVATION_TITLE,BOOKING_RESERVATION_DAY,BOOKING_RESERVATION_TIME_START,BOOKING_RESERVATION_TIME_END,BOOKING_STATUS,BOOKING_ADD_TIME';

		let where = {
			BOOKING_USER_ID: userId
		};
		//where.RESERVATION_STATUS = ['in', [ReservationModel.STATUS.COMM, ReservationModel.STATUS.OVER]]; // 状态

		if (util.isDefined(search) && search) {
			where.BOOKING_RESERVATION_TITLE = {
				$regex: '.*' + search,
				$options: 'i'
			};
		} else if (sortType) {
			// 搜索菜单
			switch (sortType) {
				case 'timedesc': { //按时间倒序
					orderBy = {
						'BOOKING_RESERVATION_DAY': 'desc',
						'BOOKING_RESERVATION_TIME_START': 'desc',
						'BOOKING_ADD_TIME': 'desc'
					};
					break;
				}
				case 'timeasc': { //按时间正序
					orderBy = {
						'BOOKING_RESERVATION_DAY': 'asc',
						'BOOKING_RESERVATION_TIME_START': 'asc',
						'BOOKING_ADD_TIME': 'asc'
					};
					break;
				}
				case 'today': { //今天
					where.BOOKING_RESERVATION_DAY = timeUtil.time('Y-M-D');
					break;
				}
				case 'tomorrow': { //明日
					where.BOOKING_RESERVATION_DAY = timeUtil.time('Y-M-D', 86400);
					break;
				}
				case 'succ': { //预约成功
					where.BOOKING_STATUS = BookingModel.STATUS.SUCC;
					//where.BOOKING_RESERVATION_DAY = ['>=', timeUtil.time('Y-M-D')];
					//where.BOOKING_RESERVATION_TIME_START = ['>=', timeUtil.time('h:m')];
					break;
				}
				case 'cancel': { //已取消
					where.BOOKING_STATUS = ['in', [BookingModel.STATUS.CANCEL, BookingModel.STATUS.ADMIN_CANCEL]];
					break;
				}
			}
		}
		let result = await BookingModel.getList(where, fields, orderBy, page, size, isTotal, oldTotal);

		return result;
	}

	/** 取得我的某日预约列表 */
	async getMyJoinSomeday(userId, day) {

		let fields = 'BOOKING_IS_CHECKIN,BOOKING_RESERVATION_ID,BOOKING_RESERVATION_TITLE,BOOKING_RESERVATION_DAY,BOOKING_RESERVATION_TIME_START,BOOKING_RESERVATION_TIME_END,BOOKING_STATUS,BOOKING_ADD_TIME';

		let where = {
			BOOKING_USER_ID: userId,
			BOOKING_RESERVATION_DAY: day
		};
		//where.RESERVATION_STATUS = ['in', [ReservationModel.STATUS.COMM, ReservationModel.STATUS.OVER]]; // 状态

		let orderBy = {
			'BOOKING_RESERVATION_TIME_START': 'asc',
			'BOOKING_ADD_TIME': 'desc'
		}

		return await BookingModel.getAll(where, fields, orderBy);


	}
}

module.exports = ReservationService;

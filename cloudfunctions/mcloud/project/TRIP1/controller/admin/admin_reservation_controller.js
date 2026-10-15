/**
 * Notes: 预约模块后台管理-控制器
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2021-12-08 10:20:00 
 */

const BaseProjectAdminController = require('./base_project_admin_controller.js');
const AdminReservationService = require('../../service/admin/admin_reservation_service.js');
const timeUtil = require('../../../../framework/utils/time_util.js');
const dataUtil = require('../../../../framework/utils/data_util.js'); 
const ReservationModel = require('../../model/reservation_model.js');
const contentCheck = require('../../../../framework/validate/content_check.js');

class AdminReservationController extends BaseProjectAdminController {

	// 计算可约天数
	_getLeaveDay(days) {
		let now = timeUtil.time('Y-M-D');
		let count = 0;
		for (let k = 0; k < days.length; k++) {
			if (days[k] >= now) count++;
		}
		return count;
	}

	async getDayList() {
		await this.isAdmin();

		let rules = {
			reservationId: 'must|id',
			start: 'must|date',
			end: 'must|date',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminReservationService();
		return await service.getDayList(input.reservationId, input.start, input.end);
	}

	/** 生成自助签到码 */
	async genSelfCheckinQr() {
		await this.isAdmin();

		let rules = {
			page: 'must|string',
			timeMark: 'must|string',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminReservationService();
		return await service.genSelfCheckinQr(input.page, input.timeMark);
	}

	/** 管理员按钮核销 */
	async checkinJoin() {
		await this.isAdmin();

		let rules = {
			joinId: 'must|id',
			flag: 'must|in:0,1'
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminReservationService();
		await service.checkinJoin(input.joinId, input.flag);
	}

	/** 管理员扫码核验 */
	async scanJoin() {
		await this.isAdmin();

		let rules = {
			reservationId: 'must|id',
			code: 'must|string|len:15',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminReservationService();
		await service.scanJoin(input.reservationId, input.code);
	}

	/** 预约排序 */
	async sortReservation() { // 数据校验
		await this.isAdmin();

		let rules = {
			reservationId: 'must|id',
			sort: 'must|int',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminReservationService();
		await service.sortReservation(input.reservationId, input.sort);
	}

	/** 首页设定 */
	async vouchReservation() {
		await this.isAdmin();

		let rules = {
			id: 'must|id',
			vouch: 'must|int',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminReservationService();
		await service.vouchReservation(input.id, input.vouch);
	}

	/** 预约状态修改 */
	async statusReservation() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			reservationId: 'must|id',
			status: 'must|int|in:0,1,9,10',
		};

		// 取得数据
		let input = this.validateData(rules);

		let title = await ReservationModel.getOneField(input.reservationId, 'RESERVATION_TITLE');

		let service = new AdminReservationService();
		await service.statusReservation(input.reservationId, input.status);

		if (title)
			this.logOther('修改了预约《' + title + '》的状态为：' + ReservationModel.getDesc('STATUS', input.status));
	}


	/** 报名状态修改 */
	async statusJoin() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			joinId: 'must|id',
			status: 'must|int|in:0,1,8,9,10,98,99',
			reason: 'string|max:200',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminReservationService();
		return await service.statusJoin(this._admin, input.joinId, input.status, input.reason);
	}

	/** 报名删除 */
	async delJoin() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			joinId: 'must|id'
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminReservationService();
		return await service.delJoin(input.joinId);
	}

	/** 预约项目列表 */
	async getAdminReservationList() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			search: 'string|min:1|max:30|name=搜索条件',
			sortType: 'string|name=搜索类型',
			sortVal: 'name=搜索类型值',
			orderBy: 'object|name=排序',
			whereEx: 'object|name=附加查询条件',
			page: 'must|int|default=1',
			size: 'int|default=10',
			isTotal: 'bool',
			oldTotal: 'int',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminReservationService();
		let result = await service.getAdminReservationList(input);

		// 数据格式化
		let list = result.list;
		for (let k = 0; k < list.length; k++) {

			list[k].RESERVATION_ADD_TIME = timeUtil.timestamp2Time(list[k].RESERVATION_ADD_TIME);
			list[k].RESERVATION_EDIT_TIME = timeUtil.timestamp2Time(list[k].RESERVATION_EDIT_TIME);
			list[k].leaveDay = this._getLeaveDay(list[k].RESERVATION_DAYS);

		}
		result.list = list;

		return result;

	}

	/** 预约名单列表 */
	async getJoinList() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			search: 'string|min:1|max:30|name=搜索条件',
			sortType: 'string|name=搜索类型',
			sortVal: 'name=搜索类型值',
			orderBy: 'object|name=排序',
			reservationId: 'must|id',
			mark: 'must|string',
			page: 'must|int|default=1',
			size: 'int|default=10',
			isTotal: 'bool',
			oldTotal: 'int',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminReservationService();
		let result = await service.getJoinList(input);

		// 数据格式化
		let list = result.list;
		for (let k = 0; k < list.length; k++) {
			list[k].BOOKING_EDIT_TIME = timeUtil.timestamp2Time(list[k].BOOKING_EDIT_TIME);

			//分解成数组，高亮显示
			let forms = list[k].BOOKING_FORMS;
			for (let j in forms) {
				forms[j].valArr = dataUtil.splitTextByKey(forms[j].val, input.search);
			}

		}
		result.list = list;

		return result;

	}

	/** 发布 */
	async insertReservation() {
		await this.isAdmin();

		let rules = {
			title: 'must|string|min:2|max:50|name=标题',
			typeId: 'must|id|name=分类',
			typeName: 'must|string|name=分类',
			order: 'must|int|min:0|max:9999|name=排序号',
			daysSet: 'must|array|name=预约时间设置',
			isShowLimit: 'must|int|in:0,1|name=是否显示可预约人数',

			formSet: 'must|array|name=用户资料设置',
		};

		// 取得数据
		let input = this.validateData(rules);

		// 内容审核
		await contentCheck.checkTextMultiAdmin(input);

		let service = new AdminReservationService();
		let result = await service.insertReservation(this._adminId, input);
 

		this.logOther('创建了新预约《' + input.title + '》');

		return result;

	}


	/** 获取预约信息用于编辑修改 */
	async getReservationDetail() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			id: 'must|id',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminReservationService();
		let detail = await service.getReservationDetail(input.id);
		return detail;
	}

	/** 编辑预约 */
	async editReservation() {
		await this.isAdmin();

		let rules = {
			id: 'must|id',
			title: 'must|string|min:2|max:50|name=标题',
			typeId: 'must|id|name=分类',
			typeName: 'must|string|name=分类',
			order: 'must|int|min:0|max:9999|name=排序号',
			daysSet: 'must|array|name=预约时间设置',

			isShowLimit: 'must|int|in:0,1|name=是否显示可预约人数',

			formSet: 'must|array|name=用户资料设置',
		};

		// 取得数据
		let input = this.validateData(rules);

		// 内容审核
		await contentCheck.checkTextMultiAdmin(input);

		let service = new AdminReservationService();
		let result = service.editReservation(input);
 

		this.logOther('修改了预约《' + input.title + '》');

		return result;
	}

	/** 删除预约 */
	async delReservation() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			reservationId: 'must|id',
		};

		// 取得数据
		let input = this.validateData(rules);

		let title = await ReservationModel.getOneField(input.reservationId, 'RESERVATION_TITLE');

		let service = new AdminReservationService();
		await service.delReservation(input.reservationId);
 

		if (title)
			this.logOther('删除了预约《' + title + '》');
	}

	/**
	 * 更新富文本信息
	 * @returns 返回 urls数组 [url1, url2, url3, ...]
	 */
	async updateReservationContent() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			id: 'must|id',
			content: 'array'
		};

		// 取得数据
		let input = this.validateData(rules);

		// 内容审核
		await contentCheck.checkTextMultiAdmin(input);

		let service = new AdminReservationService();
		return await service.updateReservationContent(input);
	}


	/**
	 * 更新封面设置
	 * @returns 返回 urls数组 [url1, url2, url3, ...]
	 */
	async updateReservationStyleSet() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			reservationId: 'must|id',
			styleSet: 'object'
		};

		// 取得数据
		let input = this.validateData(rules);

		// 内容审核
		await contentCheck.checkTextMultiAdmin(input);
 

		let service = new AdminReservationService();
		return await service.updateReservationStyleSet(input);
	}

	// 删除某时段预约记录
	async cancelJoinByTimeMark() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			reservationId: 'must|id',
			timeMark: 'must|string',
			reason: 'string'
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminReservationService();
		return await service.cancelJoinByTimeMark(this._admin, input.reservationId, input.timeMark, input.reason);
	}

	/** 创建模板 */
	async insertReservationTemp() {
		await this.isAdmin();

		let rules = {
			name: 'must|string|min:1|max:20|name=名称',
			times: 'must|array|name=模板时段',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminReservationService();
		let result = await service.insertReservationTemp(input);

		return result;

	}

	/** 编辑模板 */
	async editReservationTemp() {
		await this.isAdmin();

		let rules = {
			id: 'must|id',
			isLimit: 'must|bool|name=是否限制',
			limit: 'must|int|name=人数上限',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminReservationService();
		let result = service.editReservationTemp(input);

		return result;
	}

	/** 模板列表 */
	async getReservationTempList() {
		await this.isAdmin();

		let service = new AdminReservationService();
		let result = await service.getReservationTempList();

		return result;
	}

	/** 删除模板 */
	async delReservationTemp() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			id: 'must|id',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminReservationService();
		await service.delReservationTemp(input.id);

	}


	/**************报名数据导出 BEGIN ********************* */
	/** 当前是否有导出文件生成 */
	async joinDataGet() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			isDel: 'int|must', //是否删除已有记录
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminReservationService();

		if (input.isDel === 1)
			await service.deleteJoinDataExcel(); //先删除

		return await service.getJoinDataURL();
	}

	/** 导出数据 */
	async joinDataExport() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			reservationId: 'id|must',
			startDay: 'date|must',
			endDay: 'date|must',
			status: 'int|must|default=1'
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminReservationService();
		return await service.exportJoinDataExcel(input);
	}

	/** 删除导出的报名数据文件 */
	async joinDataDel() {
		await this.isAdmin();

		// 数据校验
		let rules = {};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminReservationService();
		return await service.deleteJoinDataExcel();
	}


}

module.exports = AdminReservationController;
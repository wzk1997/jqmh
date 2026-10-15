/**
 * Notes: 产品模块后台管理-控制器
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2021-07-11 10:20:00
 */

const BaseProjectAdminController = require('./base_project_admin_controller.js');

const AdminSpotService = require('../../service/admin/admin_spot_service.js');

const timeUtil = require('../../../../framework/utils/time_util.js');
const dataUtil = require('../../../../framework/utils/data_util.js');
const contentCheck = require('../../../../framework/validate/content_check.js');
const SpotModel = require('../../model/spot_model.js');

class AdminSpotController extends BaseProjectAdminController {

	/** 置顶与排序设定 */
	async sortSpot() {
		await this.isAdmin();

		let rules = {
			id: 'must|id',
			sort: 'must|int',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminSpotService();
		await service.sortSpot(input.id, input.sort);
	}

	/** 首页设定 */
	async vouchSpot() {
		await this.isAdmin();

		let rules = {
			id: 'must|id',
			vouch: 'must|int',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminSpotService();
		await service.vouchSpot(input.id, input.vouch);
	}

	/** 状态修改 */
	async statusSpot() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			id: 'must|id',
			status: 'must|int',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminSpotService();
		await service.statusSpot(input.id, input.status);

	}

	/** 列表 */
	async getAdminSpotList() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			search: 'string|min:1|max:30|name=搜索条件',
			sortType: 'string|name=搜索类型',
			sortVal: 'name=搜索类型值',
			orderBy: 'object|name=排序',
			whereEx: 'object|name=附加查询条件',
			page: 'must|int|default=1',
			size: 'int',
			isTotal: 'bool',
			oldTotal: 'int',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminSpotService();
		let result = await service.getAdminSpotList(input);

		// 数据格式化
		let list = result.list;
		for (let k = 0; k < list.length; k++) {
			list[k].SPOT_ADD_TIME = timeUtil.timestamp2Time(list[k].SPOT_ADD_TIME, 'Y-M-D h:m:s');

			if (list[k].SPOT_OBJ && list[k].SPOT_OBJ.desc)
				delete list[k].SPOT_OBJ.desc;
		}
		result.list = list;

		return result;

	}


	/** 发布 */
	async insertSpot() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			title: 'must|string|min:2|max:50|name=标题',
			cateId: 'must|string|name=分类',
			cateName: 'must|string|name=分类名称',
			order: 'must|int|min:0|max:9999|name=排序号',
			forms: 'array|name=表单',
		};


		// 取得数据
		let input = this.validateData(rules);

		// 内容审核
		await contentCheck.checkTextMultiAdmin(input);

		let service = new AdminSpotService();
		let result = await service.insertSpot(input);

		this.logOther('添加了《' + input.title + '》');

		return result;

	}


	/** 获取信息用于编辑修改 */
	async getSpotDetail() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			id: 'must|id',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminSpotService();
		return await service.getSpotDetail(input.id);

	}

	/** 编辑 */
	async editSpot() {
		await this.isAdmin();

		let rules = {
			id: 'must|id',
			title: 'must|string|min:2|max:50|name=标题',
			cateId: 'must|string|name=分类',
			cateName: 'must|string|name=分类名称',
			order: 'must|int|min:0|max:9999|name=排序号',
			forms: 'array|name=表单',
		};

		// 取得数据
		let input = this.validateData(rules);

		// 内容审核
		await contentCheck.checkTextMultiAdmin(input);

		let service = new AdminSpotService();
		let result = service.editSpot(input);

		this.logOther('修改了《' + input.title + '》');

		return result;
	}

	/** 删除 */
	async delSpot() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			id: 'must|id',
		};

		// 取得数据
		let input = this.validateData(rules);

		let title = await SpotModel.getOneField(input.id, 'SPOT_TITLE');

		let service = new AdminSpotService();
		await service.delSpot(input.id);

		if (title)
			this.logOther('删除了《' + title + '》');

	}

	/** 更新图片信息 */
	async updateSpotForms() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			id: 'must|id',
			hasImageForms: 'array'
		};

		// 取得数据
		let input = this.validateData(rules);

		// 内容审核
		await contentCheck.checkTextMultiAdmin(input);

		let service = new AdminSpotService();
		return await service.updateSpotForms(input);
	}

}

module.exports = AdminSpotController;

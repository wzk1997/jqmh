/**
 * Notes: 相册模块控制器
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2022-06-07 04:00:00
 */

const BaseProjectController = require('./base_project_controller.js');
const GuideService = require('../service/guide_service.js');
const timeUtil = require('../../../framework/utils/time_util.js');

class GuideController extends BaseProjectController {

	/** 列表 */
	async getGuideList() {

		// 数据校验
		let rules = {
			search: 'string|min:1|max:30|name=搜索条件',
			sortType: 'string|name=搜索类型',
			sortVal: 'name=搜索类型值',
			orderBy: 'object|name=排序',
            sortMode: 'string|name=攻略排序模式',
			page: 'must|int|default=1',
			size: 'int',
			isTotal: 'bool',
			oldTotal: 'int',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new GuideService();
		let result = await service.getGuideList(input);

		// 数据格式化
		let list = result.list;

		for (let k = 0; k < list.length; k++) {
			list[k].GUIDE_ADD_TIME = timeUtil.timestamp2Time(list[k].GUIDE_ADD_TIME, 'Y-M-D');

			if (list[k].GUIDE_OBJ && list[k].GUIDE_OBJ.detail)
			delete list[k].GUIDE_OBJ.detail;
		}

		return result;

	}


	/** 浏览详细 */
	async viewGuide() {
		// 数据校验
		let rules = {
			id: 'must|id',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new GuideService();
		let guide = await service.viewGuide(input.id);

		if (guide) {
			// 显示转换
			guide.GUIDE_ADD_TIME = timeUtil.timestamp2Time(guide.GUIDE_ADD_TIME, 'Y-M-D');
		}

		return guide;
	}

}

module.exports = GuideController;

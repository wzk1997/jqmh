/**
 * Notes: 产品模块控制器
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2022-06-08 04:00:00 
 */

const BaseProjectController = require('./base_project_controller.js');
const SpotService = require('../service/spot_service.js');
const timeUtil = require('../../../framework/utils/time_util.js');
const dataUtil = require('../../../framework/utils/data_util.js');

class SpotController extends BaseProjectController {

	/** 列表 */
	async getSpotList() {

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

		let service = new SpotService();
		let result = await service.getSpotList(input);

		// 数据格式化
		let list = result.list;

		for (let k = 0; k < list.length; k++) {
			list[k].SPOT_ADD_TIME = timeUtil.timestamp2Time(list[k].SPOT_ADD_TIME, 'Y-M-D');
			list[k].SPOT_OBJ.desc = dataUtil.fmtText(list[k].SPOT_OBJ.desc, 100);
			list[k].SPOT_OBJ.star =  (list[k].SPOT_OBJ.star);
		}

		return result;

	}


	/** 浏览详细 */
	async viewSpot() {
		// 数据校验
		let rules = {
			id: 'must|id',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new SpotService();
		let spot = await service.viewSpot(input.id);

		if (spot) {
			// 显示转换 
			spot.SPOT_ADD_TIME = timeUtil.timestamp2Time(spot.SPOT_ADD_TIME, 'Y-M-D');
		}

		return spot;
	}

}

module.exports = SpotController;
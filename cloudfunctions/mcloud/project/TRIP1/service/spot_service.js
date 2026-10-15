/**
 * Notes: 产品模块业务逻辑
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2022-06-08 07:48:00
 */

const BaseProjectService = require('./base_project_service.js');
const util = require('../../../framework/utils/util.js');
const SpotModel = require('../model/spot_model.js');

class SpotService extends BaseProjectService {

	/** 浏览资讯信息 */
	async viewSpot(id) {

		let fields = '*';

		let where = {
			_id: id, SPOT_DELETED: ['<>',true],
			SPOT_STATUS: SpotModel.STATUS.COMM
		}
		let spot = await SpotModel.getOne(where, fields);
		if (!spot) return null;

		SpotModel.inc(id, 'SPOT_VIEW_CNT', 1);

		delete spot.SPOT_DRAFT;
        delete spot.SPOT_EDIT_ADMIN;
        return spot;
	}


	/** 取得分页列表 */
	async getSpotList({
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
			'SPOT_ORDER': 'asc',
			'SPOT_ADD_TIME': 'desc'
		};
		let fields = 'SPOT_DEMO,SPOT_VIEW_CNT,SPOT_TITLE,SPOT_CATE_ID,SPOT_ADD_TIME,SPOT_ORDER,SPOT_STATUS,SPOT_CATE_NAME,SPOT_OBJ';

		let where = { SPOT_DELETED: ['<>',true] };
		where.and = {
			SPOT_DELETED: ['<>',true],
			_pid: this.getProjectId() //复杂的查询在此处标注PID
		};

		where.and.SPOT_STATUS = SpotModel.STATUS.COMM; // 状态


		if (util.isDefined(search) && search) {
			where.or = [
				{ SPOT_TITLE: ['like', search] },
                { 'SPOT_OBJ.desc': ['like', search] },
                { 'SPOT_OBJ.subtitle': ['like', search] },
			];
		}
        if (sortType && util.isDefined(sortVal)) {
			// 搜索菜单
			switch (sortType) {
				case 'cateId': {
					if (sortVal) where.and.SPOT_CATE_ID = String(sortVal);
					break;
				}
				case 'sort': {
					orderBy = this.fmtOrderBySort(sortVal, 'SPOT_ADD_TIME');
					break;
				}
			}
		}

		return await SpotModel.getList(where, fields, orderBy, page, size, isTotal, oldTotal);
	}


}

module.exports = SpotService;

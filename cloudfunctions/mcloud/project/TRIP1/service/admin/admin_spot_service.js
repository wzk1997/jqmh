const CmsService = require('./admin_cms_service.js');
/**
 * Notes: 产品后台管理
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2022-06-08 07:48:00 
 */

const BaseProjectAdminService = require('./base_project_admin_service.js');
const AdminHomeService = require('../admin/admin_home_service.js');
const dataUtil = require('../../../../framework/utils/data_util.js');
const util = require('../../../../framework/utils/util.js');
const cloudUtil = require('../../../../framework/cloud/cloud_util.js');
const timeUtil = require('../../../../framework/utils/time_util.js');
const SpotModel = require('../../model/spot_model.js');

class AdminSpotService extends BaseProjectAdminService {

	/** 推荐首页SETUP */
	async vouchSpotSetup(id, vouch) {
		return this.vouchSpot(id, vouch);
	}

	/**添加 */
	async insertSpot({
		title,
		cateId,
		cateName,
		order,
		forms
	}) {


		return new CmsService().saveContent('spot', {title,cateId,cateName,order,forms}, '', true);
	}

	/**删除数据 */
	async delSpot(id) {
		return new CmsService().remove('spot', id);

	}

	/**获取信息 */
	async getSpotDetail(id) {
		let fields = '*';

		let where = {
			_id: id, SPOT_DELETED: ['<>',true]
		}
		let spot = await SpotModel.getOne(where, fields);
		if (!spot) return null;

		return spot;
	}

	// 更新forms信息
	async updateSpotForms({
		id,
		hasImageForms
	}) {
		return new CmsService().patchContent('spot', id, 'forms', hasImageForms);
	}


	/**更新数据 */
	async editSpot({
		id,
		title,
		cateId, // 二级分类 
		cateName,
		order,
		forms,
	}) {

		return new CmsService().saveContent('spot', {id,title,cateId,cateName,order,forms}, '', true);
	}

	/**取得分页列表 */
	async getAdminSpotList({
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
			'SPOT_ORDER': 'asc',
			'SPOT_ADD_TIME': 'desc'
		};
		let fields = 'SPOT_TITLE,SPOT_CATE_ID,SPOT_CATE_NAME,SPOT_EDIT_TIME,SPOT_ADD_TIME,SPOT_ORDER,SPOT_STATUS,SPOT_VOUCH,,SPOT_QR,SPOT_OBJ';

		let where = {};
		where.and = {
			SPOT_DELETED: ['<>',true],
			_pid: this.getProjectId() //复杂的查询在此处标注PID
		};

		if (util.isDefined(search) && search) {
			where.or = [
				{ SPOT_TITLE: ['like', search] },
			];

		} else if (sortType && util.isDefined(sortVal)) {
			// 搜索菜单
			switch (sortType) {
				case 'cateId': {
					where.and.SPOT_CATE_ID = String(sortVal);
					break;
				}
				case 'status': {
					where.and.SPOT_STATUS = Number(sortVal);
					break
				}
				case 'vouch': {
						where.and.SPOT_VOUCH = 1;
					break;
					}
				case 'top': {
						where.and.SPOT_ORDER = 0;
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

	/**修改状态 */
	async statusSpot(id, status) {
		if (![0,1].includes(status)) this.AppError('状态不正确'); return new CmsService().setState('spot', id, status === 1 ? 'published' : 'offline');
	}

	/**置顶与排序设定 */
	async sortSpot(id, sort) {
		return new CmsService().sort('spot', id, sort);

	}

	/**首页设定 */
	async vouchSpot(id, vouch) {
		if (![0,1].includes(vouch)) this.AppError('推荐状态不正确'); await new CmsService().detail('spot', id); await SpotModel.edit(id, {SPOT_VOUCH:vouch}); return {id};
	}
}

module.exports = AdminSpotService;
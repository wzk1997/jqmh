const CmsService = require('./admin_cms_service.js');
/**
 * Notes: 相册后台管理
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2021-07-11 07:48:00 
 */

const BaseProjectAdminService = require('./base_project_admin_service.js');

const dataUtil = require('../../../../framework/utils/data_util.js');
const util = require('../../../../framework/utils/util.js');
const cloudUtil = require('../../../../framework/cloud/cloud_util.js');
const timeUtil = require('../../../../framework/utils/time_util.js');
const GuideModel = require('../../model/guide_model.js');
const AdminHomeService = require('../admin/admin_home_service.js');

class AdminGuideService extends BaseProjectAdminService {

	/** 推荐首页SETUP */
	async vouchGuideSetup(id, vouch) {
		return this.vouchGuide(id, vouch);
	}

	/**添加 */
	async insertGuide({
		title,
		cateId,
		cateName,
		order,
		forms
	}) {


		return new CmsService().saveContent('guide', {title,cateId,cateName,order,forms}, '', true);
	}

	/**删除数据 */
	async delGuide(id) {
		return new CmsService().remove('guide', id);

	}

	/**获取信息 */
	async getGuideDetail(id) {
		let fields = '*';

		let where = {
			_id: id, GUIDE_DELETED: ['<>',true]
		}
		let guide = await GuideModel.getOne(where, fields);
		if (!guide) return null;

		return guide;
	}

	// 更新forms信息
	async updateGuideForms({
		id,
		hasImageForms
	}) {
		return new CmsService().patchContent('guide', id, 'forms', hasImageForms);
	}


	/**更新数据 */
	async editGuide({
		id,
		title,
		cateId, // 二级分类 
		cateName,
		order,
		forms,
	}) {

		return new CmsService().saveContent('guide', {id,title,cateId,cateName,order,forms}, '', true);
	}

	/**取得分页列表 */
	async getAdminGuideList({
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
			'GUIDE_ORDER': 'asc',
			'GUIDE_ADD_TIME': 'desc'
		};
		let fields = 'GUIDE_TITLE,GUIDE_CATE_ID,GUIDE_CATE_NAME,GUIDE_EDIT_TIME,GUIDE_ADD_TIME,GUIDE_ORDER,GUIDE_STATUS,GUIDE_VOUCH,GUIDE_QR,GUIDE_OBJ';

		let where = {};
		where.and = {
			GUIDE_DELETED: ['<>',true],
			_pid: this.getProjectId() //复杂的查询在此处标注PID
		};

		if (util.isDefined(search) && search) {
			where.or = [
				{ GUIDE_TITLE: ['like', search] },
			];

		} else if (sortType && util.isDefined(sortVal)) {
			// 搜索菜单
			switch (sortType) {
				case 'cateId': {
					where.and.GUIDE_CATE_ID = String(sortVal);
					break;
				}
				case 'status': {
					where.and.GUIDE_STATUS = Number(sortVal);
					break;
				}
				case 'vouch': {
					where.and.GUIDE_VOUCH = 1;
					break;
					}
				case 'top': {
						where.and.GUIDE_ORDER = 0;
					break;
					}
				case 'sort': {
					orderBy = this.fmtOrderBySort(sortVal, 'GUIDE_ADD_TIME');
					break;
				}
			}
		}

		return await GuideModel.getList(where, fields, orderBy, page, size, isTotal, oldTotal);
	}

	/**修改状态 */
	async statusGuide(id, status) {
		if (![0,1].includes(status)) this.AppError('状态不正确'); return new CmsService().setState('guide', id, status === 1 ? 'published' : 'offline');
	}

	/**置顶与排序设定 */
	async sortGuide(id, sort) {
		return new CmsService().sort('guide', id, sort);
	}

	/**首页设定 */
	async vouchGuide(id, vouch) {
		if (![0,1].includes(vouch)) this.AppError('推荐状态不正确'); await new CmsService().detail('guide', id); await GuideModel.edit(id, {GUIDE_VOUCH:vouch}); return {id};
	}
}

module.exports = AdminGuideService;
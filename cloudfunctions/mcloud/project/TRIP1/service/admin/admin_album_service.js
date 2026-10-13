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
const AlbumModel = require('../../model/album_model.js');
const AdminHomeService = require('../admin/admin_home_service.js');

class AdminAlbumService extends BaseProjectAdminService {

	/** 推荐首页SETUP */
	async vouchAlbumSetup(id, vouch) {
		return this.vouchAlbum(id, vouch);
	}

	/**添加 */
	async insertAlbum({
		title,
		cateId,
		cateName,
		order,
		forms
	}) {


		return new CmsService().saveLegacy('album', {title,cateId,cateName,order,forms}, '', true);
	}

	/**删除数据 */
	async delAlbum(id) {
		return new CmsService().remove('album', id);

	}

	/**获取信息 */
	async getAlbumDetail(id) {
		let fields = '*';

		let where = {
			_id: id, ALBUM_DELETED: ['<>',true]
		}
		let album = await AlbumModel.getOne(where, fields);
		if (!album) return null;

		return album;
	}

	// 更新forms信息
	async updateAlbumForms({
		id,
		hasImageForms
	}) {
		return new CmsService().patchLegacy('album', id, 'forms', hasImageForms);
	}


	/**更新数据 */
	async editAlbum({
		id,
		title,
		cateId, // 二级分类 
		cateName,
		order,
		forms,
	}) {

		return new CmsService().saveLegacy('album', {id,title,cateId,cateName,order,forms}, '', true);
	}

	/**取得分页列表 */
	async getAdminAlbumList({
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
			'ALBUM_ORDER': 'asc',
			'ALBUM_ADD_TIME': 'desc'
		};
		let fields = 'ALBUM_TITLE,ALBUM_CATE_ID,ALBUM_CATE_NAME,ALBUM_EDIT_TIME,ALBUM_ADD_TIME,ALBUM_ORDER,ALBUM_STATUS,ALBUM_VOUCH,ALBUM_QR,ALBUM_OBJ';

		let where = {};
		where.and = {
			ALBUM_DELETED: ['<>',true],
			_pid: this.getProjectId() //复杂的查询在此处标注PID
		};

		if (util.isDefined(search) && search) {
			where.or = [
				{ ALBUM_TITLE: ['like', search] },
			];

		} else if (sortType && util.isDefined(sortVal)) {
			// 搜索菜单
			switch (sortType) {
				case 'cateId': {
					where.and.ALBUM_CATE_ID = String(sortVal);
					break;
				}
				case 'status': {
					where.and.ALBUM_STATUS = Number(sortVal);
					break;
				}
				case 'vouch': {
					where.and.ALBUM_VOUCH = 1;
					break;
					}
				case 'top': {
						where.and.ALBUM_ORDER = 0;
					break;
					}
				case 'sort': {
					orderBy = this.fmtOrderBySort(sortVal, 'ALBUM_ADD_TIME');
					break;
				}
			}
		}

		return await AlbumModel.getList(where, fields, orderBy, page, size, isTotal, oldTotal);
	}

	/**修改状态 */
	async statusAlbum(id, status) {
		if (![0,1].includes(status)) this.AppError('状态不正确'); return new CmsService().setState('album', id, status === 1 ? 'published' : 'offline');
	}

	/**置顶与排序设定 */
	async sortAlbum(id, sort) {
		return new CmsService().sort('album', id, sort);
	}

	/**首页设定 */
	async vouchAlbum(id, vouch) {
		if (![0,1].includes(vouch)) this.AppError('推荐状态不正确'); await new CmsService().detail('album', id); await AlbumModel.edit(id, {ALBUM_VOUCH:vouch}); return {id};
	}
}

module.exports = AdminAlbumService;
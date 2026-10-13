/**
 * Notes: 资讯模块业务逻辑
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2020-10-29 07:48:00 
 */

const BaseProjectService = require('./base_project_service.js');
const util = require('../../../framework/utils/util.js');
const NewsModel = require('../model/news_model.js');

class NewsService extends BaseProjectService {

	/** 浏览资讯信息 */
	async viewNews(id) {

		let fields = '*';

		let where = {
			_id: id, NEWS_DELETED: ['<>',true],
			NEWS_STATUS: 1
		}
		let news = await NewsModel.getOne(where, fields);
		if (!news) return null;



		delete news.NEWS_DRAFT;
        delete news.NEWS_EDIT_ADMIN;
        return news;
	}


	/** 取得分页列表 */
	async getNewsList({
		search, // 搜索条件
		sortType, // 搜索菜单
		sortVal, // 搜索菜单
		orderBy, // 排序
		cateGroup,
        cateId, //附加查询条件
		page,
		size,
		isTotal = true,
		oldTotal
	}) {

		orderBy = orderBy || {
			'NEWS_ORDER': 'asc',
			'NEWS_ADD_TIME': 'desc'
		};
		let fields = 'NEWS_DEMO,NEWS_PIC,NEWS_VIEW_CNT,NEWS_TITLE,NEWS_DESC,NEWS_CATE_ID,NEWS_ADD_TIME,NEWS_ORDER,NEWS_STATUS,NEWS_CATE_NAME,NEWS_OBJ,NEWS_ACTIVITY_START,NEWS_ACTIVITY_END,NEWS_PUBLISH_TIME';

		let where = { NEWS_DELETED: ['<>',true] };
		where.NEWS_STATUS = 1; // 状态 

		if(cateGroup==='scenic'){
            const categories=await require('./cms_service.js').categories('news');
            const ids=categories.map(c=>c.id).filter(id=>!['2','3'].includes(id));
            // A category selection narrows the scenic group, including an empty intersection.
            where.NEWS_CATE_ID=['in',cateId&&cateId!=='0'?ids.filter(id=>id===cateId):ids];
        }
        else if (cateId && cateId !== '0') where.NEWS_CATE_ID = cateId;

		if (util.isDefined(search) && search) {
			where.NEWS_TITLE = {
				$regex: '.*' + util.escapeRegex(search),
				$options: 'i'
			};
		} else if (sortType && util.isDefined(sortVal)) {
			// 搜索菜单
			switch (sortType) {
				case 'sort': {
					orderBy = this.fmtOrderBySort(sortVal, 'NEWS_ADD_TIME');
					break;
					}
			}
		}

		return await NewsModel.getList(where, fields, orderBy, page, size, isTotal, oldTotal);
	}  

}

module.exports = NewsService;

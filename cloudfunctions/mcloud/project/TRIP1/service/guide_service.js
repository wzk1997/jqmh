/**
 * Notes: 相册模块业务逻辑
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2022-06-07 07:48:00
 */

const BaseProjectService = require('./base_project_service.js');
const util = require('../../../framework/utils/util.js');
const GuideModel = require('../model/guide_model.js');

class GuideService extends BaseProjectService {

	/** 浏览资讯信息 */
	async viewGuide(id) {

		let fields = '*';

		let where = {
			_id: id, GUIDE_DELETED: ['<>',true],
			GUIDE_STATUS: GuideModel.STATUS.COMM
		}
		let guide = await GuideModel.getOne(where, fields);
		if (!guide) return null;

        const linked=(guide.GUIDE_OBJ && guide.GUIDE_OBJ.spots)||[];
        if(linked.length){
            const SpotModel=require('../model/spot_model.js');
            const rows=await Promise.all(linked.map(spotId=>SpotModel.getOne({_id:spotId,SPOT_STATUS:1,SPOT_DELETED:['<>',true]},'_id,SPOT_TITLE,SPOT_OBJ,SPOT_CATE_NAME')));
            guide.GUIDE_SPOTS=rows.filter(Boolean).map(spot=>{const node=(guide.GUIDE_ROUTE||[]).find(n=>n.spotId===spot._id)||{};return {_id:spot._id,SPOT_TITLE:spot.SPOT_TITLE,SPOT_OBJ:spot.SPOT_OBJ||{},duration:node.duration||'',note:node.note||'',highlight:node.highlight||'',cover:((spot.SPOT_OBJ||{}).cover||[])[0]||''};});
        }else guide.GUIDE_SPOTS=[];
		GuideModel.inc(id, 'GUIDE_VIEW_CNT', 1);

		delete guide.GUIDE_DRAFT;
        delete guide.GUIDE_EDIT_ADMIN;
        return guide;
	}


	/** 取得分页列表 */
	async getGuideList({
		search, // 搜索条件
		sortType, // 搜索菜单
		sortVal, // 搜索菜单
		orderBy, // 排序
        sortMode,
		page,
		size,
		isTotal = true,
		oldTotal
	}) {

        if(sortMode && sortMode!=='latest')require('./cms_validation.js').fail('攻略排序模式不正确');

        if(orderBy){
            const valid=['GUIDE_ORDER','GUIDE_VIEW_CNT','GUIDE_ADD_TIME','GUIDE_EDIT_TIME','GUIDE_TITLE','GUIDE_STATUS'];
            const normalized={};
            for(const key of Object.keys(orderBy))if(!valid.includes(key)||!['asc','desc'].includes(orderBy[key]))require('./cms_validation.js').fail('攻略排序不正确');
            // Cloud transport may canonicalize object keys. Rebuild semantic precedence on the server.
            for(const key of valid)if(orderBy[key])normalized[key]=orderBy[key];
            orderBy=Object.keys(normalized).length?normalized:undefined;
        }
		orderBy = orderBy || {
			'GUIDE_ORDER': 'asc',
			'GUIDE_ADD_TIME': 'desc'
		};
		let fields = 'GUIDE_DEMO,GUIDE_DURATION,GUIDE_ROUTE,GUIDE_OBJ,GUIDE_VIEW_CNT,GUIDE_TITLE,GUIDE_CATE_ID,GUIDE_ADD_TIME,GUIDE_PUBLISH_TIME,GUIDE_ORDER,GUIDE_STATUS,GUIDE_CATE_NAME';

		let where = { GUIDE_DELETED: ['<>',true] };
		where.and = {
			GUIDE_DELETED: ['<>',true],
			_pid: this.getProjectId() //复杂的查询在此处标注PID
		};

		where.and.GUIDE_STATUS = GuideModel.STATUS.COMM; // 状态


		if (util.isDefined(search) && search) {
			where.or = [
				{ GUIDE_TITLE: ['like', search] },
                { 'GUIDE_OBJ.desc': ['like', search] },
			];
		}
        if (sortType && util.isDefined(sortVal)) {
			// 搜索菜单
			switch (sortType) {
				case 'cateId': {
					if (sortVal) where.and.GUIDE_CATE_ID = String(sortVal);
					break;
				}
				case 'sort': {
					orderBy = this.fmtOrderBySort(sortVal, 'GUIDE_ADD_TIME');
					break;
				}
			}
		}

        if(sortMode==='latest') {
            const dbUtil=require('../../../framework/database/db_util.js'),v=require('./cms_validation.js'),a=dbUtil.getCmd().aggregate;
            const effective=a.cond({if:a.gt([a.ifNull(['$GUIDE_PUBLISH_TIME',0]),0]),then:'$GUIDE_PUBLISH_TIME',else:'$GUIDE_ADD_TIME'});
            return dbUtil.getListComputed(GuideModel.CL,where,fields,{__publishSort:effective},{__publishSort:'desc',_id:'asc'},v.integer(page,'页码',1,10000,1),v.integer(size,'每页数量',1,50,20),isTotal,oldTotal);
        }
		return await GuideModel.getList(where, fields, orderBy, page, size, isTotal, oldTotal);
	}


}

module.exports = GuideService;

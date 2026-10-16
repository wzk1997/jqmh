/**
 * Notes: 相册模块业务逻辑
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2022-06-07 07:48:00 
 */

const BaseProjectService = require('./base_project_service.js');
const util = require('../../../framework/utils/util.js');
const AlbumModel = require('../model/album_model.js');

class AlbumService extends BaseProjectService {

	/** 浏览资讯信息 */
	async viewAlbum(id) {

		let fields = '*';

		let where = {
			_id: id, ALBUM_DELETED: ['<>',true],
			ALBUM_STATUS: AlbumModel.STATUS.COMM
		}
		let album = await AlbumModel.getOne(where, fields);
		if (!album) return null; 

        const linked=(album.ALBUM_OBJ && album.ALBUM_OBJ.spots)||[];
        if(linked.length){
            const ProductModel=require('../model/product_model.js');
            const rows=await Promise.all(linked.map(spotId=>ProductModel.getOne({_id:spotId,PRODUCT_STATUS:1,PRODUCT_DELETED:['<>',true]},'_id,PRODUCT_TITLE,PRODUCT_OBJ,PRODUCT_CATE_NAME')));
            album.ALBUM_SPOTS=rows.filter(Boolean).map(spot=>{const node=(album.ALBUM_ROUTE||[]).find(n=>n.spotId===spot._id)||{};return {_id:spot._id,PRODUCT_TITLE:spot.PRODUCT_TITLE,PRODUCT_OBJ:spot.PRODUCT_OBJ||{},duration:node.duration||'',note:node.note||'',highlight:node.highlight||'',cover:((spot.PRODUCT_OBJ||{}).cover||[])[0]||''};});
        }else album.ALBUM_SPOTS=[];
		AlbumModel.inc(id, 'ALBUM_VIEW_CNT', 1);

		delete album.ALBUM_DRAFT;
        delete album.ALBUM_EDIT_ADMIN;
        return album;
	}


	/** 取得分页列表 */
	async getAlbumList({
		search, // 搜索条件
		sortType, // 搜索菜单
		sortVal, // 搜索菜单
		orderBy, // 排序 
        sortMode,
		page = 1,
		size = 20,
		isTotal = true,
		oldTotal
	}) {

        if(sortMode && sortMode!=='latest')require('./cms_validation.js').fail('攻略排序模式不正确');

        if(orderBy){
            const valid=['ALBUM_ORDER','ALBUM_VIEW_CNT','ALBUM_ADD_TIME','ALBUM_EDIT_TIME','ALBUM_TITLE','ALBUM_STATUS'];
            const normalized={};
            for(const key of Object.keys(orderBy))if(!valid.includes(key)||!['asc','desc'].includes(orderBy[key]))require('./cms_validation.js').fail('攻略排序不正确');
            // Cloud transport may canonicalize object keys. Rebuild semantic precedence on the server.
            for(const key of valid)if(orderBy[key])normalized[key]=orderBy[key];
            orderBy=Object.keys(normalized).length?normalized:undefined;
        }
		orderBy = orderBy || {
			'ALBUM_ORDER': 'asc',
			'ALBUM_ADD_TIME': 'desc'
		};
		// List cards need cover, summary and linked IDs, never the full article or itinerary.
		let fields = 'ALBUM_DEMO,ALBUM_DURATION,ALBUM_OBJ.cover,ALBUM_OBJ.desc,ALBUM_OBJ.spots,ALBUM_VIEW_CNT,ALBUM_TITLE,ALBUM_CATE_ID,ALBUM_ADD_TIME,ALBUM_PUBLISH_TIME,ALBUM_ORDER,ALBUM_STATUS,ALBUM_CATE_NAME';

		let where = { ALBUM_DELETED: ['<>',true] };
		where.and = {
			ALBUM_DELETED: ['<>',true],
			_pid: this.getProjectId() //复杂的查询在此处标注PID
		};

		where.and.ALBUM_STATUS = AlbumModel.STATUS.COMM; // 状态  


		if (util.isDefined(search) && search) {
			where.or = [
				{ ALBUM_TITLE: ['like', search] },
                { 'ALBUM_OBJ.desc': ['like', search] },
			];
		}
        if (sortType && util.isDefined(sortVal)) {
			// 搜索菜单
			switch (sortType) {
				case 'cateId': {
					if (sortVal) where.and.ALBUM_CATE_ID = String(sortVal);
					break;
				}
				case 'sort': {
					orderBy = this.fmtOrderBySort(sortVal, 'ALBUM_ADD_TIME');
					break;
				}
			}
		}

        // First-page offset does not depend on the count, so both reads can start together.
        const withTotal = async read => {
            if(isTotal && Number(page)===1) {
                const [total,result]=await Promise.all([AlbumModel.count(where),read(false)]);
                return {...result,total,count:Math.ceil(total/Number(result.size || size))};
            }
            return read(isTotal);
        };
        if(sortMode==='latest') {
            const dbUtil=require('../../../framework/database/db_util.js'),v=require('./cms_validation.js'),a=dbUtil.getCmd().aggregate;
            const effective=a.cond({if:a.gt([a.ifNull(['$ALBUM_PUBLISH_TIME',0]),0]),then:'$ALBUM_PUBLISH_TIME',else:'$ALBUM_ADD_TIME'});
            const currentPage=v.integer(page,'页码',1,10000,1),pageSize=v.integer(size,'每页数量',1,50,20);
            return withTotal(total=>dbUtil.getListComputed(AlbumModel.CL,where,fields,{__publishSort:effective},{__publishSort:'desc',_id:'asc'},currentPage,pageSize,total,oldTotal));
        }
		return withTotal(total=>AlbumModel.getList(where, fields, orderBy, page, size, total, oldTotal));
	}


}

module.exports = AlbumService;

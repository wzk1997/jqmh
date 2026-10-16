/**
 * Notes: 后台HOME/登录模块 
 * Date: 2021-06-15 07:48:00 
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 */

const BaseProjectAdminService = require('./base_project_admin_service.js');
const UserModel = require('../../model/user_model.js');
const MeetModel = require('../../model/meet_model.js');
const NewsModel = require('../../model/news_model.js');
const ProductModel = require('../../model/product_model.js');   
const AlbumModel = require('../../model/album_model.js');
const constants = require('../../public/constants.js');
const setupUtil = require('../../../../framework/utils/setup/setup_util.js');

class AdminHomeService extends BaseProjectAdminService {

	/**
	 * 首页数据归集
	 */
    async adminHome() {
        const Cms = require('./admin_cms_service.js');
        const Feedback = require('../../model/feedback_model.js');
        const cms = new Cms();
        const modules = [['scenic','景区介绍'],['album','攻略数'],['merchant','商家数'],['news','资讯数'],['product','景点数']];
        const results = await Promise.all(modules.map(async ([module,title])=>{
            const Model=cms.model(module);await cms.ensure(Model);
            return {title,cnt:await Model.count({[module.toUpperCase()+'_DELETED']:['<>',true]})};
        }));
        await cms.ensure(Feedback);
        results.push({title:'待处理反馈',cnt:await Feedback.count({FEEDBACK_STATUS:['in',[0,2]]})});
        return results;
    }

	// 用户数据清理  
	async clearUserData(userId) {

	}


	//##################首页推荐
	// 首页推荐清理
	async clearVouchData() {
		await setupUtil.remove(constants.SETUP_HOME_VOUCH_KEY);

		await Promise.all([NewsModel.edit({}, { NEWS_VOUCH: 0 }), MeetModel.edit({}, { MEET_VOUCH: 0 }), AlbumModel.edit({}, { ALBUM_VOUCH: 0 }), ProductModel.edit({}, { PRODUCT_VOUCH: 0 })]); 

	}


	/**添加首页推荐 */
	async updateHomeVouch(node) {
		if (node.ext) node.ext = '#' + node.ext;
		let key = constants.SETUP_HOME_VOUCH_KEY;
		let list = await setupUtil.get(key);
		if (!list || !Array.isArray(list)) list = [];

		// 重复性判断
		for (let k = 0; k < list.length; k++) {
			if (list[k].id == node.id) {
				// 已存在
				list[k] = node;
				return await setupUtil.set(key, list, 'vouch');
			}
		}

		// 赋值 
		let data = node;
		list.unshift(data);
		await setupUtil.set(key, list, 'vouch');

	}

	/**删除推荐数据 */
	async delHomeVouch(id) {
		let key = constants.SETUP_HOME_VOUCH_KEY;
		let list = await setupUtil.get(key);
		if (!list || !Array.isArray(list)) return;

		let newList = [];
		for (let k = 0; k < list.length; k++) {
			if (list[k].id != id) {
				newList.push(list[k]);
			}
		}

		return await setupUtil.set(key, newList, 'vouch');

	}
}

module.exports = AdminHomeService;
/**
 * Notes: 全局/首页模块业务逻辑
 * Date: 2021-03-15 04:00:00 
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 */

const BaseProjectService = require('./base_project_service.js');
const setupUtil = require('../../../framework/utils/setup/setup_util.js');

class HomeService extends BaseProjectService {

	async getSetup(key) {
		if (!['SETUP_CONTENT_ABOUT','SETUP_CONTENT_BUS','SETUP_CONTENT_PARKING','SETUP_CONTENT_TOLIET','SETUP_CONTENT_LXS','SETUP_CONTENT_DY','SETUP_CONTENT_WEATHER'].includes(key)) this.AppError('该配置不可公开访问');
		return await setupUtil.get(key);
	}


}

module.exports = HomeService;
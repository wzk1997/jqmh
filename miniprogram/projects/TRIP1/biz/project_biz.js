/**
 * Notes: 项目通用业务逻辑
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2022-05-22 07:48:00 
 */

const BaseBiz = require('../../../comm/biz/base_biz.js'); 
const projectSetting = require('../public/project_setting.js');
const PubilcBiz = require('../../../comm/biz/public_biz.js');
const { getChrome } = require('../ui/navigation_ui.js');
const PassportBiz = require('../../../comm/biz/passport_biz.js'); 

class ProjectBiz extends BaseBiz {

    static syncTabBar(page, selected) {
        if (typeof page.getTabBar !== 'function') return;
        const update = () => {
            const tabBar = page.getTabBar();
            if (tabBar) tabBar.setData({ selected });
        };
        update();
        if (wx.nextTick) wx.nextTick(update);
    }

	/**
	 * 页面初始化    
	 * @param {*} that  
	 */
	static initPage(that, { isSetNavColor = true } = {}) {    

		let skin = {};
		skin.NAV_BG = projectSetting.NAV_BG;
		skin.NAV_COLOR = projectSetting.NAV_COLOR;
		skin.PROJECT_COLOR = projectSetting.PROJECT_COLOR;
		
		PubilcBiz.initPageBase(that, { skin, isSetNavColor });
        that.setData({ uiChrome: getChrome(), mediaUrls: require('../../../helper/media_helper.js').snapshot() });
        if (isSetNavColor) wx.setNavigationBarColor({ backgroundColor: skin.NAV_BG, frontColor: skin.NAV_COLOR });
	}

}

module.exports = ProjectBiz;

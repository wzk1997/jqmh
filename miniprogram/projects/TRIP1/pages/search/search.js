const behavior = require('../../../../comm/behavior/search_bh.js');
const ProjectBiz = require('../../biz/project_biz.js');
const pageHelper = require('../../../../helper/page_helper.js');

Page({
    bindScenicLayout(e) { this.setData({uiChrome:e.detail}); },

	behaviors: [behavior],

	onReady: function () {
		ProjectBiz.initPage(this);


		let curPage = pageHelper.getPrevPage(1);
		if (!curPage) return;
		if (curPage.options && curPage.options.source == 'admin') {
			wx.setNavigationBarColor({ //管理端顶部
				backgroundColor: '#ffffff',
				frontColor: '#000000',
			});
		}

	},

})
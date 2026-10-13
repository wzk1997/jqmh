const behavior = require('../../../../../comm/behavior/my_fav_bh.js');
const ProjectBiz = require('../../../biz/project_biz.js');

Page({
    bindScenicLayout(e) { this.setData({uiChrome:e.detail}); },

	behaviors: [behavior],

	onReady: function () { 
		ProjectBiz.initPage(this);
	},
})
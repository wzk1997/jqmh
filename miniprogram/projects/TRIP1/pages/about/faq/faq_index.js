const ProjectBiz=require('../../../biz/project_biz.js');
Page({
    bindScenicLayout(e) { this.setData({uiChrome:e.detail}); },onLoad(){ProjectBiz.initPage(this);}});

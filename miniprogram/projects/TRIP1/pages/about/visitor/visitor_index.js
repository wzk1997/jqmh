const ProjectBiz=require('../../../biz/project_biz.js');
const pageHelper=require('../../../../../helper/page_helper.js');
Page({
    bindScenicLayout(e) { this.setData({uiChrome:e.detail}); },onLoad(){ProjectBiz.initPage(this);},url(e){pageHelper.url(e,this);}});

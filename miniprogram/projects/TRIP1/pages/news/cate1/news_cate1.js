const ProjectBiz=require('../../../biz/project_biz.js');
Page({onLoad(options={}){ProjectBiz.initPage(this);wx.redirectTo({url:'/projects/TRIP1/pages/news/index/news_index?id='+encodeURIComponent(options.id||'0')});}});

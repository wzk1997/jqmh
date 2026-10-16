const ProjectBiz=require('../../../biz/project_biz.js');
const pageHelper=require('../../../../../helper/page_helper.js');
const services=require('../../../ui/service_ui.js');
Page({data:{services:[],servicesLoading:false,servicesError:false},onShow(){if(!this.data.servicesLoaded&&!this.data.servicesLoading)return services.load(this);},retryServices(){return services.load(this);},onPullDownRefresh(){return services.load(this).finally(()=>wx.stopPullDownRefresh());},
    bindScenicLayout(e) { this.setData({uiChrome:e.detail}); },onLoad(){ProjectBiz.initPage(this);},url(e){pageHelper.url(e,this);}});

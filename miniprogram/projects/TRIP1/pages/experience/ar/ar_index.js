const ProjectBiz = require('../../../biz/project_biz.js');
const pageHelper = require('../../../../../helper/page_helper.js');
const config = require('../../../ui/scene_config.js');
const { openARProvider } = require('../../../ui/experience_adapter.js');
Page({
    bindScenicLayout(e) { this.setData({uiChrome:e.detail}); },
 data:{backdrop:config.arBackdrop,cameraActive:false,cameraError:''},
 onLoad(){ProjectBiz.initPage(this,{isSetNavColor:false});},
 bindCamera(){this.setData({cameraActive:!this.data.cameraActive,cameraError:''});},
 bindCameraError(){this.setData({cameraActive:false,cameraError:'相机暂不可用，请检查微信相机权限'});},
 bindProvider(){openARProvider({page:this});},
 bindExit(){if(getCurrentPages().length>1)wx.navigateBack();else wx.switchTab({url:'/projects/TRIP1/pages/product/index/product_index'});},
 url(e){pageHelper.url(e,this);}
});

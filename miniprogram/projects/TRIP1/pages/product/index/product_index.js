const ProjectBiz = require('../../../biz/project_biz.js');
const pageHelper = require('../../../../../helper/page_helper.js');
const {normalizeContent}=require('../../../ui/content_ui.js');
const config=require('../../../ui/scene_config.js');

Page({
    bindScenicLayout(e) { this.setData({uiChrome:e.detail}); },
	/**
	 * 页面的初始数据
	 */
	data: { mapImage:config.mapImage, mapMode:true, guideItems:[], selected:null, mapScale:1,

	},

	/**
		 * 生命周期函数--监听页面加载
		 */
	onLoad: function () {
		ProjectBiz.initPage(this);
		this.setData({_params:{}});
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () { },

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: async function () {
        ProjectBiz.syncTabBar(this, 1);

	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {

	},

	url: async function (e) {
		pageHelper.url(e, this);
	},

	bindCommListCmpt: function (e) {
		pageHelper.commListListener(this, e);
        const points=[{x:27,y:24},{x:60,y:33},{x:39,y:49},{x:71,y:61},{x:23,y:70},{x:58,y:80}];
        const list=((e.detail.dataList||e.detail.data||{}).list||((this.data.dataList||{}).list)||[]).map(i=>normalizeContent(i,'product')).filter(i=>i.id);
        const guideItems=list.slice(0,6).map((item,index)=>({...item,...points[index]}));
		const selected=this.data.selected?guideItems.find(i=>i.id===this.data.selected.id)||null:null;
        this.setData({guideItems,selected});
	},


	onShareAppMessage: function () {

	},

    bindMapMode(){this.setData({mapMode:!this.data.mapMode});},
    bindPin(e){this.setData({selected:this.data.guideItems.find(i=>i.id===e.currentTarget.dataset.id)||null});},
	clearPin(){if(this.data.selected)this.setData({selected:null});},
    bindZoom(){this.setData({mapScale:this.data.mapScale===1?1.45:1});},
    bindReset(){this.setData({mapScale:1});}

})

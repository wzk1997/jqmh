const cloudHelper = require('../../../../../helper/cloud_helper.js');
const pageHelper = require('../../../../../helper/page_helper.js');
const ProjectBiz = require('../../../biz/project_biz.js');

Page({
    selectTab(e){this.setData({detailTab:e.currentTarget.dataset.tab});},
    photoChange(e){this.setData({photoIndex:e.detail.current});},
    previewPhoto(e){const media=require('../../../../../helper/media_helper.js');wx.previewImage({current:media.display(e.currentTarget.dataset.url),urls:this.data.photos.map(media.display)});},
    bindScenicLayout(e) { this.setData({uiChrome:e.detail}); },
	/**
	 * 页面的初始数据
	 */
	data: {
		isLoad: false,
        detailTab:'intro',photos:[],photoIndex:0,
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: async function (options) {
		ProjectBiz.initPage(this);

		if (!pageHelper.getOptions(this, options)) return;

		this._loadDetail();

	},

	_loadDetail: async function () {
		let id = this.data.id;
		if (!id) return;

		let params = {
			id,
		};
		let opt = {
			title: 'bar'
		};
		let product = await cloudHelper.callCloudData('product/view', params, opt);
		if (!product || !product._id) {
			this.setData({
				isLoad: null
			})
			return;
		}

		this.setData({
			isLoad: true,
			product,
            photos:((product.PRODUCT_OBJ.album||[]).length?product.PRODUCT_OBJ.album:(product.PRODUCT_OBJ.cover||[])).filter(src=>src&&src!=='/images/cover.gif'),
		});

	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () { },

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () { },

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () { },

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () { },

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: async function () {
		await this._loadDetail();
		wx.stopPullDownRefresh();
	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () { },

	url: function (e) {
		pageHelper.url(e, this);
	},

	onPageScroll: function (e) {
		// 回页首按钮
		pageHelper.showTopBtn(e, this);

	},

	onShareAppMessage: function (res) {
        if (!this.data.product) return { title: 'WeTravel' };
		return {
			title: this.data.product.PRODUCT_TITLE,
			imageUrl: (this.data.product.PRODUCT_OBJ.cover || [])[0] || ''
		}
	}
})
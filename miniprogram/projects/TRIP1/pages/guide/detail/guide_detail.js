const cloudHelper = require('../../../../../helper/cloud_helper.js');
const pageHelper = require('../../../../../helper/page_helper.js');
const ProjectBiz = require('../../../biz/project_biz.js');

Page({
    bindScenicLayout(e) { this.setData({uiChrome:e.detail}); },
	/**
	 * 页面的初始数据
	 */
	data: {
		isLoad: false,
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
		let guide = await cloudHelper.callCloudData('guide/view', params, opt);
		if (!guide || !guide._id) {
			this.setData({
				isLoad: null
			})
			return;
		}

		const spots=guide.GUIDE_SPOTS||[];
        this.setData({
            spots,introText:((guide.GUIDE_OBJ.detail||[]).find(n=>n.type==='text')||{val:guide.GUIDE_OBJ.desc||''}).val.split('\n\n')[0],
			isLoad: true,
			guide,
            highlights:spots.filter(s=>s.cover&&s.cover!=='/images/cover.gif').slice(0,4),
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
        if (!this.data.guide) return { title: 'WeTravel' };
		return {
			title: this.data.guide.GUIDE_TITLE,
			imageUrl: (this.data.guide.GUIDE_OBJ.cover || [])[0] || ''
		}
	}
})
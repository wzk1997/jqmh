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
		let album = await cloudHelper.callCloudData('album/view', params, opt);
		if (!album || !album._id) {
			this.setData({
				isLoad: null
			})
			return;
		}

		const spots=album.ALBUM_SPOTS||[];
        this.setData({
            spots,introText:((album.ALBUM_OBJ.detail||[]).find(n=>n.type==='text')||{val:album.ALBUM_OBJ.desc||''}).val.split('\n\n')[0],
			isLoad: true,
			album,
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
        if (!this.data.album) return { title: 'WeTravel' };
		return {
			title: this.data.album.ALBUM_TITLE,
			imageUrl: (this.data.album.ALBUM_OBJ.cover || [])[0] || ''
		}
	}
})
const pageHelper = require('../../helper/page_helper.js');
const cloudHelper = require('../../helper/cloud_helper.js');

module.exports = Behavior({
	/**
	 * 页面的初始数据
	 */
	data: {
	},

	methods: {
		/**
		 * 生命周期函数--监听页面加载
		 */
		onLoad: async function (options) {
		},

		myCommListListener: function (e) {
			pageHelper.commListListener(this, e);
		},

		/**
		 * 生命周期函数--监听页面初次渲染完成
		 */
		onReady: function () {

		},

		/**
		 * 生命周期函数--监听页面显示
		 */
		onShow: function () {

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


		/**
		 * 页面上拉触底事件的处理函数
		 */
		onReachBottom: function () {

		},

		url: function (e) {
			pageHelper.url(e, this);
		},

		bindDelTap: async function (e) {

			let oid = e.currentTarget.dataset.oid;
			if (!oid) return;
			let that = this;
			let callback = async function () {
				that._removingFavs = that._removingFavs || new Set();
				if (that._removingFavs.has(oid)) return;
				that._removingFavs.add(oid);
				try { await cloudHelper.callCloudSumbit('fav/del', {
					oid
				}).then(res => {
					const before = that.data.dataList.list || [];
					const list = before.filter(item => item.FAV_OID !== oid);
					const removed = before.length - list.length;
					that.data.dataList.list = list;
					that.data.dataList.total = Math.max(0, (Number(that.data.dataList.total) || 0) - removed);
					if (that.data.dataList.size > 0) that.data.dataList.count = Math.ceil(that.data.dataList.total / that.data.dataList.size);
					require('../biz/public_biz.js').removeCacheList('my-fav');
					that.setData({
						dataList: that.data.dataList
					});
					const listComponent = that.selectComponent && that.selectComponent('#favList');
					if (listComponent) listComponent.setData({_dataList:that.data.dataList});
					pageHelper.showSuccToast('删除成功');
				}).catch(err => {
					console.log(err);
				 }); } finally { that._removingFavs.delete(oid); }
			}
			pageHelper.showConfirm('您确认删除？', callback);
		}
	}
})

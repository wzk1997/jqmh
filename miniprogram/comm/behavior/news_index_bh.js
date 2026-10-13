const pageHelper = require('../../helper/page_helper.js');
module.exports = Behavior({
	/**
	 * 页面的初始数据
	 */
	data: {
	},

	methods: {
        bindNewsCategory(e) { this._setCate(this.data.newsCateList, {}, e.detail.value); },
		/**
			* 生命周期函数--监听页面加载
			*/
		onLoad: async function (options) {

		},

		/**
		 * 生命周期函数--监听页面初次渲染完成
		 */
		onReady: function () { },

		/**
		 * 生命周期函数--监听页面显示
		 */
		onShow: async function () {

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
		},

		/**
		 * 用户点击右上角分享
		 */
		onShareAppMessage: function () {

		},

		_setCate(cateList, options, cateId = 0) {
			if (!cateId) {
				if (options && options.id) {
					cateId = options.id;
				}
			} 

            const selected = cateList.find(item => String(item.id) === String(cateId));
            const newsHeading = !selected ? '景区资讯' : (String(cateId) === '1' ? '活动资讯' : selected.title);
            this.setData({
                newsCateList: cateList,
                newsCategory: String(cateId),
                newsHeading,
                newsSubtitle: String(cateId) === '2' ? '发现旅途中的地方风味' : String(cateId) === '3' ? '把地方好物带回家' : '阅读景区故事，了解最新动态',
                newsFilters: [{ label: '全部', value: '0' }].concat(cateList.map(item => ({ label: item.title, value: String(item.id) }))),
                listMode: 'leftpic',
				_params: {
					cateId,
				}
			});



			for (let k = 0; k < cateList.length; k++) {
				if (cateList[k].id == cateId) {
					wx.setNavigationBarTitle({
						title: cateList[k].title
					});

					if (cateList[k].style) { //样式
						this.setData({
							listMode: cateList[k].style
						});
					} else {
						this.setData({
							listMode: 'leftbig1'
						});
					}

				}
			}
		}

	}
})
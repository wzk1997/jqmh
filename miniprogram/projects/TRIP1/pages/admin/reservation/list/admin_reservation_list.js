const AdminBiz = require('../../../../../../comm/biz/admin_biz.js');
const AdminReservationBiz = require('../../../../biz/admin_reservation_biz.js');
const pageHelper = require('../../../../../../helper/page_helper.js');
const cloudHelper = require('../../../../../../helper/cloud_helper.js');

Page({

	/**
	 * 页面的初始数据
	 */
	data: {},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: async function (options) {
		if (!AdminBiz.isAdmin(this)) return;

		//设置搜索菜单
		await this._getSearchMenu();
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: async function () { },

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

	bindScanTap: function (e) {
		let reservationId = pageHelper.dataset(e, 'id');
		let title = encodeURIComponent(pageHelper.dataset(e, 'title'));
		wx.navigateTo({
			url: '../scan/admin_reservation_scan?reservationId=' + reservationId + '&title=' + title,
		});
	},

	bindRecordSelectTap: async function (e) {
		let itemList = ['预约名单', '管理员核销预约码'];
		let reservationId = pageHelper.dataset(e, 'id');
		let title = encodeURIComponent(pageHelper.dataset(e, 'title'));

		wx.showActionSheet({
			itemList,
			success: async res => {
				switch (res.tapIndex) {
					case 0: { //预约名单
						wx.navigateTo({
							url: '../record/admin_record_list?reservationId=' + reservationId + '&title=' + title,
						});
						break;
					}
					case 1: { //核验
						this.bindScanTap(e);
						break;
					}
				}


			},
			fail: function (res) { }
		})
	},

	_setSort: async function (e) {
		if (!AdminBiz.isAdmin(this)) return;

		let reservationId = pageHelper.dataset(e, 'id');
		let sort = pageHelper.dataset(e, 'sort');
		if (!reservationId) return;

		let params = {
			reservationId,
			sort
		}

		try {
			await cloudHelper.callCloudSumbit('admin/reservation_sort', params).then(res => {
				pageHelper.modifyListNode(reservationId, this.data.dataList.list, 'RESERVATION_ORDER', sort);
				this.setData({
					dataList: this.data.dataList
				});
				pageHelper.showSuccToast('设置成功');
			});
		} catch (err) {
			console.log(err);
		}
	},

	_setVouch: async function (e) {
		if (!AdminBiz.isAdmin(this)) return;

		let id = pageHelper.dataset(e, 'id');
		let vouch = pageHelper.dataset(e, 'vouch');
		if (!id) return;

		let params = {
			id,
			vouch
		}

		try {
			await cloudHelper.callCloudSumbit('admin/reservation_vouch', params).then(res => {
				pageHelper.modifyListNode(id, this.data.dataList.list, 'RESERVATION_VOUCH', vouch);
				this.setData({
					dataList: this.data.dataList
				});
				pageHelper.showSuccToast('设置成功');
			});
		} catch (err) {
			console.log(err);
		}
	},

	bindMoreSelectTap: async function (e) {
		if (!AdminBiz.isAdmin(this)) return;
		let idx = pageHelper.dataset(e, 'idx');

		let order = this.data.dataList.list[idx].RESERVATION_ORDER;
		let orderDesc = (order == 0) ? '取消置顶' : '置顶';

		let vouch = this.data.dataList.list[idx].RESERVATION_VOUCH;
		let vouchDesc = (vouch == 0) ? '推荐到首页' : '取消首页推荐';

		let itemList = ['预览', orderDesc, vouchDesc, '生成专属二维码'];

		wx.showActionSheet({
			itemList,
			success: async res => {
				switch (res.tapIndex) {
					case 0: { //预览
						let reservationId = pageHelper.dataset(e, 'id');
						wx.navigateTo({
							url: pageHelper.fmtURLByPID('/pages/reservation/detail/reservation_detail?id=' + reservationId),
						});
						break;
					}
					case 1: { //置顶
						let sort = (order == 0) ? 9999 : 0;
						e.currentTarget.dataset['sort'] = sort;
						await this._setSort(e);
						break;
					}
					case 2: { //上首页
						vouch = (vouch == 0) ? 1 : 0;
						e.currentTarget.dataset['vouch'] = vouch;
						await this._setVouch(e);
						break;
					}
					case 3: { //二维码
						let title = encodeURIComponent(pageHelper.dataset(e, 'title'));
						let qr = encodeURIComponent(pageHelper.dataset(e, 'qr'));
						wx.navigateTo({
							url: `../../setup/qr/admin_setup_qr?title=${title}&qr=${qr}`,
						})
						break;
					}
				}


			},
			fail: function (res) { }
		})
	},

	bindStatusSelectTap: async function (e) {
		let itemList = ['启用', '停止预约 (用户可见)', '关闭 (用户不可见)', '删除'];
		let reservationId = pageHelper.dataset(e, 'id');
		wx.showActionSheet({
			itemList,
			success: async res => {
				switch (res.tapIndex) {
					case 0: { //启用
						await this._setStatus(this, reservationId, 1);
						break;
					}
					case 1: { //停止预约
						await this._setStatus(this, reservationId, 9);
						break;
					}
					case 2: { //关闭
						await this._setStatus(this, reservationId, 10);
						break;
					}
					case 3: { //删除
						await this._del(this, reservationId);
						break;
					}

				}


			},
			fail: function (res) { }
		})
	},


	_del: async function (that, reservationId) {
		if (!AdminBiz.isAdmin(this)) return;
		if (!reservationId) return;

		let params = {
			reservationId
		}

		let callback = async function () {
			try {
				let opts = {
					title: '删除中'
				}
				await cloudHelper.callCloudSumbit('admin/reservation_del', params, opts).then(res => {
					pageHelper.delListNode(reservationId, that.data.dataList.list, '_id');
					that.data.dataList.total--;
					that.setData({
						dataList: that.data.dataList
					});
					pageHelper.showSuccToast('删除成功');
				});
			} catch (e) {
				console.log(e);
			}
		}
		pageHelper.showConfirm('确认删除？删除不可恢复', callback);

	},

	_setStatus: async function (that, reservationId, status) {
		if (!AdminBiz.isAdmin(this)) return;
		if (!reservationId) return;

		let params = {
			reservationId,
			status
		}
		try {
			await cloudHelper.callCloudSumbit('admin/reservation_status', params).then(res => {
				pageHelper.modifyListNode(reservationId, that.data.dataList.list, 'RESERVATION_STATUS', status, '_id');
				that.setData({
					dataList: that.data.dataList
				});
				pageHelper.showSuccToast('设置成功');
			});
		} catch (e) {
			console.log(e);
		}
	},

	_getSearchMenu: async function () {
		let sortItem1 = [{ label: '分类', type: '', value: '' }];
		sortItem1 = sortItem1.concat(AdminReservationBiz.getTypeList());

		let sortItems = [sortItem1];

		let sortMenus = [{
			label: '全部',
			type: '',
			value: ''
		}, {
			label: '使用中',
			type: 'status',
			value: 1
		},
		{
			label: '已停止',
			type: 'status',
			value: 9
		},
		{
			label: '已关闭',
			type: 'status',
			value: 10
		},

		];
		this.setData({
			sortItems,
			sortMenus
		})


	}

})

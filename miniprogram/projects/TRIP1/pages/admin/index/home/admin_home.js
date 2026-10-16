const cms=require('../../../../ui/cms_ui.js');
const AdminBiz = require('../../../../../../comm/biz/admin_biz.js');
const pageHelper = require('../../../../../../helper/page_helper.js');
const cloudHelper = require('../../../../../../helper/cloud_helper.js');

Page({

	/**
	 * 页面的初始数据
	 */
	data: {modules:[{id:'scenic',title:'园区简介',icon:'icon-home'},{id:'album',title:'园区攻略',icon:'icon-pic'},{id:'merchant',title:'吃住行',icon:'icon-shop'},{id:'news',title:'活动资讯',icon:'icon-form'},{id:'feedback',title:'客户反馈',icon:'icon-edit'}]},
    openModule(e){const id=e.currentTarget.dataset.id;wx.navigateTo({url:id==='feedback'?'/projects/TRIP1/pages/admin/feedback/admin_feedback':'/projects/TRIP1/pages/admin/cms/list/cms_list?module='+id});},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: async function (options) {
		if (!AdminBiz.isAdmin(this)) return;

		this._loadDetail();
	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: async function () {
		await this._loadDetail();
		wx.stopPullDownRefresh();
	},

	_loadDetail: async function () {

		let admin = AdminBiz.getAdminToken();
		this.setData({
			isLoad: true,
			admin,
            modules:this.data.modules.filter(module=>cms.can(admin,module.id,'read')),
            canProduct:cms.can(admin,'product','read'),canScenic:cms.can(admin,'scenic','read')
		});

		try {
			let opts = {
				title: 'bar'
			}
			let res = await cloudHelper.callCloudData('admin/home', {}, opts);
			this.setData({
				stat: Array.isArray(res) ? res.filter(item => item.title !== '预约项目') : []
			});

		} catch (err) {
			console.log(err);
		}
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

	url: function (e) {
		pageHelper.url(e, this);
	},

	bindMoreTap: function (e) {
		let itemList = ['取消所有首页推荐'];
		wx.showActionSheet({
			itemList,
			success: async res => {
				let idx = res.tapIndex;

				if (idx == 0) {
					this._clearVouch();
				}

			},
			fail: function (res) { }
		})
	},

	_clearVouch: async function (e) {
		let cb = async () => {
			try {
				await cloudHelper.callCloudSumbit('admin/clear_vouch').then(res => {
					pageHelper.showSuccToast('操作成功');
				})
			} catch (err) {
				console.log(err);
			}
		};
		pageHelper.showConfirm('您确认清除所有首页推荐？', cb)
	},

	bindExitTap: function (e) {

		let callback = function () {
			AdminBiz.clearAdminToken();
			wx.reLaunch({
				url: pageHelper.fmtURLByPID('/pages/default/index/default_index'),
			});
		}
		pageHelper.showConfirm('您确认退出?', callback);
	},

})

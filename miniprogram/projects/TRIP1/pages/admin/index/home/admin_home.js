const cms=require('../../../../ui/cms_ui.js');
const {MODULES,visibleStats}=require('../../../../ui/admin_modules.js');
const AdminBiz = require('../../../../../../comm/biz/admin_biz.js');
const pageHelper = require('../../../../../../helper/page_helper.js');
const cloudHelper = require('../../../../../../helper/cloud_helper.js');

Page({

	/**
	 * 页面的初始数据
	 */
	data: {modules:[],stat:[]},
    openModule(e){
        const id=e.currentTarget.dataset.id;
        if(!MODULES.some(item=>item.id===id&&!item.hidden)||!cms.can(AdminBiz.getAdminToken(),id,'read'))return;
        wx.navigateTo({url:id==='feedback'?'/projects/TRIP1/pages/admin/feedback/admin_feedback':'/projects/TRIP1/pages/admin/cms/list/cms_list?module='+id});
    },

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
            modules:MODULES.filter(module=>!module.hidden&&module.id!=='product'&&cms.can(admin,module.id,'read')),
            canProduct:cms.can(admin,'product','read'),canScenic:cms.can(admin,'scenic','read')
		});

		try {
			let opts = {
				title: 'bar'
			}
			let res = await cloudHelper.callCloudData('admin/home', {}, opts);
			this.setData({
				stat: visibleStats(res,module=>cms.can(admin,module,'read'))
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

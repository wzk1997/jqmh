const {getChrome}=require('../../../../ui/navigation_ui.js');
const AdminBiz = require('../../../../../../comm/biz/admin_biz.js');
const pageHelper = require('../../../../../../helper/page_helper.js');
const PublicBiz = require('../../../../../../comm/biz/public_biz.js');
const cloudHelper = require('../../../../../../helper/cloud_helper.js');
const validate = require('../../../../../../helper/validate.js');
const AdminSpotBiz = require('../../../../biz/admin_spot_biz.js');
const SpotBiz = require('../../../../biz/spot_biz.js');

Page({
    bindScenicLayout(e){this.setData({uiChrome:e.detail});},

	/**
	 * 页面的初始数据
	 */
	data: {
        uiChrome:getChrome(),

	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: async function (options) {
        if (!AdminBiz.isAdmin(this)) return;
        wx.redirectTo({url:'/projects/TRIP1/pages/admin/cms/edit/cms_edit?module=spot'});
        return;
		if (!AdminBiz.isAdmin(this)) return;

		this.setData(AdminSpotBiz.initFormData());
		this.setData({
			isLoad: true
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

	url: function (e) {
		pageHelper.url(e, this);
	},

	bindFormSubmit: async function () {
		if (!AdminBiz.isAdmin(this)) return;

		let data = this.data;
		data = validate.check(data, AdminSpotBiz.CHECK_FORM, this);
		if (!data) return;

		let forms = this.selectComponent("#cmpt-form").getForms(true);
		if (!forms) return;
		data.forms = forms;

		data.cateName = SpotBiz.getCateName(data.cateId);

		try {

			// 创建
			let result = await cloudHelper.callCloudSumbit('admin/spot_insert', data);
			let spotId = result.data.id;

			// 图片
			await cloudHelper.transFormsTempPics(forms, 'spot/', spotId, 'admin/spot_update_forms');


			let callback = async function () {
				PublicBiz.removeCacheList('admin-spot-list');
				PublicBiz.removeCacheList('spot-list');
				wx.navigateBack();

			}
			pageHelper.showSuccToast('添加成功', 2000, callback);

		} catch (err) {
			console.log(err);
		}

	},

})

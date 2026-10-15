const {getChrome}=require('../../../../ui/navigation_ui.js');
const AdminBiz = require('../../../../../../comm/biz/admin_biz.js');
const pageHelper = require('../../../../../../helper/page_helper.js');
const PublicBiz = require('../../../../../../comm/biz/public_biz.js');
const cloudHelper = require('../../../../../../helper/cloud_helper.js');
const validate = require('../../../../../../helper/validate.js');
const AdminGuideBiz = require('../../../../biz/admin_guide_biz.js');
const GuideBiz = require('../../../../biz/guide_biz.js');

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
        wx.redirectTo({url:'/projects/TRIP1/pages/admin/cms/edit/cms_edit?module=guide'});
        return;
		if (!AdminBiz.isAdmin(this)) return;

		this.setData(AdminGuideBiz.initFormData());
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
		data = validate.check(data, AdminGuideBiz.CHECK_FORM, this);
		if (!data) return;

		let forms = this.selectComponent("#cmpt-form").getForms(true);
		if (!forms) return;
		data.forms = forms;

		data.cateName = GuideBiz.getCateName(data.cateId);

		try {

			// 创建
			let result = await cloudHelper.callCloudSumbit('admin/guide_insert', data);
			let guideId = result.data.id;

			// 图片
			await cloudHelper.transFormsTempPics(forms, 'guide/', guideId, 'admin/guide_update_forms');


			let callback = async function () {
				PublicBiz.removeCacheList('admin-guide-list');
				PublicBiz.removeCacheList('guide-list');
				wx.navigateBack();

			}
			pageHelper.showSuccToast('添加成功', 2000, callback);

		} catch (err) {
			console.log(err);
		}

	},

})

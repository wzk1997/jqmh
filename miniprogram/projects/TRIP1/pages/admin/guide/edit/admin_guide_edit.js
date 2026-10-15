const {getChrome}=require('../../../../ui/navigation_ui.js');
const AdminBiz = require('../../../../../../comm/biz/admin_biz.js');
const pageHelper = require('../../../../../../helper/page_helper.js');
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
		isLoad: false,
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: async function (options) {
        if (!AdminBiz.isAdmin(this)) return;
        wx.redirectTo({url:'/projects/TRIP1/pages/admin/cms/edit/cms_edit?module=guide' + (options && options.id ? '&id='+options.id : '')});
        return;
		if (!AdminBiz.isAdmin(this)) return;
		if (!pageHelper.getOptions(this, options)) return;

		this._loadDetail();
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
		this.selectComponent("#cmpt-form").reload();
		wx.stopPullDownRefresh();
	},

	model: function (e) {
		pageHelper.model(this, e);
	},

	_loadDetail: async function () {
		if (!AdminBiz.isAdmin(this)) return;

		let id = this.data.id;
		if (!id) return;

		if (!this.data.isLoad) this.setData(AdminGuideBiz.initFormData(id)); // 初始化表单数据

		let params = {
			id
		};
		let opt = {
			title: 'bar'
		};
		let guide = await cloudHelper.callCloudData('admin/guide_detail', params, opt);
		if (!guide) {
			this.setData({
				isLoad: null
			})
			return;
		};

		this.setData({
			isLoad: true,

			formTitle: guide.GUIDE_TITLE,
			formCateId: guide.GUIDE_CATE_ID,
			formOrder: guide.GUIDE_ORDER,

			formForms: guide.GUIDE_FORMS,
		});
	},

	bindFormSubmit: async function () {
		if (!AdminBiz.isAdmin(this)) return;

		// 数据校验
		let data = this.data;
		data = validate.check(data, AdminGuideBiz.CHECK_FORM, this);
		if (!data) return;

		let forms = this.selectComponent("#cmpt-form").getForms(true);
		if (!forms) return;
		data.forms = forms;

		data.cateName = GuideBiz.getCateName(data.cateId);

		try {
			let guideId = this.data.id;
			data.id = guideId;

			// 先修改，再上传
			await cloudHelper.callCloudSumbit('admin/guide_edit', data);

			await cloudHelper.transFormsTempPics(forms, 'guide/', guideId, 'admin/guide_update_forms');

			let callback = async () => {

				// 更新列表页面数据
				let node = {
					'GUIDE_TITLE': data.title,
					'GUIDE_CATE_NAME': data.cateName,
					'GUIDE_ORDER': data.order,
				}
				pageHelper.modifyPrevPageListNodeObject(guideId, node);

				wx.navigateBack();

			}
			pageHelper.showSuccToast('修改成功', 2000, callback);

		} catch (err) {
			console.log(err);
		}

	},


	url: function (e) {
		pageHelper.url(e, this);
	}

})

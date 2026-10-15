const {getChrome}=require('../../../../ui/navigation_ui.js');
const AdminBiz = require('../../../../../../comm/biz/admin_biz.js');
const pageHelper = require('../../../../../../helper/page_helper.js');
const cloudHelper = require('../../../../../../helper/cloud_helper.js');
const dataHelper = require('../../../../../../helper/data_helper.js');
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
		isLoad: false,
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: async function (options) {
        if (!AdminBiz.isAdmin(this)) return;
        wx.redirectTo({url:'/projects/TRIP1/pages/admin/cms/edit/cms_edit?module=spot' + (options && options.id ? '&id='+options.id : '')});
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

		if (!this.data.isLoad) this.setData(AdminSpotBiz.initFormData(id)); // 初始化表单数据

		let params = {
			id
		};
		let opt = {
			title: 'bar'
		};
		let spot = await cloudHelper.callCloudData('admin/spot_detail', params, opt);
		if (!spot) {
			this.setData({
				isLoad: null
			})
			return;
		};

		this.setData({
			isLoad: true,

			formTitle: spot.SPOT_TITLE,
			formCateId: spot.SPOT_CATE_ID,
			formOrder: spot.SPOT_ORDER,

			formForms: spot.SPOT_FORMS,
		});
	},

	bindFormSubmit: async function () {
		if (!AdminBiz.isAdmin(this)) return;

		// 数据校验
		let data = this.data;
		data = validate.check(data, AdminSpotBiz.CHECK_FORM, this);
		if (!data) return;

		let forms = this.selectComponent("#cmpt-form").getForms(true);
		if (!forms) return;
		data.forms = forms;

		data.cateName = SpotBiz.getCateName(data.cateId);

		try {
			let spotId = this.data.id;
			data.id = spotId;

			// 先修改，再上传
			await cloudHelper.callCloudSumbit('admin/spot_edit', data);

			await cloudHelper.transFormsTempPics(forms, 'spot/', spotId, 'admin/spot_update_forms');

			let callback = () => {
				// 更新列表页面数据
				let node = {
					'SPOT_TITLE': data.title,
					'SPOT_CATE_NAME': data.cateName,
					'SPOT_ORDER': data.order,
				}
				pageHelper.modifyPrevPageListNodeObject(spotId, node);

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

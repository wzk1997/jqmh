const {getChrome}=require('../../../../ui/navigation_ui.js');
const AdminBiz = require('../../../../../../comm/biz/admin_biz.js');
const pageHelper = require('../../../../../../helper/page_helper.js');
const cloudHelper = require('../../../../../../helper/cloud_helper.js');
const projectSetting = require('../../../../public/project_setting.js');

Page({
    bindScenicLayout(e){this.setData({uiChrome:e.detail});},

	/**
	 * 页面的初始数据
	 */
	data: {
        uiChrome:getChrome(),
		isLoad: false,
		key: '',

	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: async function (options) {
		if (!AdminBiz.isAdmin(this)) return;

		if (options && options.key) {
			let key = options.key;
			for (let k = 0; k < projectSetting.SETUP_CONTENT_ITEMS.length; k++) {
				let item = projectSetting.SETUP_CONTENT_ITEMS[k];
				if (item.key == key) {
					this._loadDetail(item);
					wx.setNavigationBarTitle({
						title: '编辑' + item.title,
					});
					this.setData({ key: item.key });
					break;
				}
			}
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

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: async function () {
		await this._loadDetail();
		wx.stopPullDownRefresh();
	},

	_loadDetail: async function (item) {
		if (!AdminBiz.isAdmin(this)) return;

		let opts = {
			'title': 'bar'
		};
		let params = {
			key: item.key
		}

		try {
			await cloudHelper.callCloudSumbit('home/setup_get', params, opts).then(res => {
				let formContent = [{ type: 'text', val: item.title }];
				let content = res.data;
				if (content && Array.isArray(content)) {
					formContent = content;
				}
				this.setData({
					isLoad: true,

					// 表单数据   
					formContent

				});


			});
		}
		catch (err) {
			console.log(err);
		}


	},


	/** 
	 * 数据提交
	 */
    bindFormSubmit: async function () {
        if (!AdminBiz.isAdmin(this) || this.data.saving) return;
        this.setData({saving:true});
        const confirmed=await new Promise(resolve=>wx.showModal({title:'发布服务信息',content:'确认保存并更新游客端服务信息？',confirmColor:'#146C60',success:r=>resolve(r.confirm),fail:()=>resolve(false)}));
        if(!confirmed){this.setData({saving:false});return;}
        this.setData({saving:true});
        try {
            const formContent=this.selectComponent('#contentEditor').getNodeList();
            await cloudHelper.transRichEditorTempPics(formContent,'setup/',this.data.key,'admin/setup_set_content',true);
            pageHelper.showSuccToast('修改成功',1500,()=>wx.navigateBack());
        } catch(err) { pageHelper.showNoneToast(err.msg||err.message||'保存失败，请重试'); }
        finally { this.setData({saving:false}); }
    },

})
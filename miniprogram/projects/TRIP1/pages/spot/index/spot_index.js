const ProjectBiz = require('../../../biz/project_biz.js');
const pageHelper = require('../../../../../helper/page_helper.js');
const {normalizeContent}=require('../../../ui/content_ui.js');
const config=require('../../../ui/scene_config.js');
const SpotBiz = require('../../../biz/spot_biz.js');

Page({
    bindScenicLayout(e) { this.setData({uiChrome:e.detail}); },
	/**
	 * 页面的初始数据
	 */
	data: { mapImage:config.mapImage, mapMode:true, guideItems:[], selected:null, mapScale:1, guideTab:'spots',

	},

	/**
		 * 生命周期函数--监听页面加载
		 */
	onLoad: async function (options) {
		ProjectBiz.initPage(this);

		this._getSearchMenu();

		if (options && options.id) {
			this.setData({
				_params: {
					sortType: 'cateId',
					sortVal: options.id,
				}
			});
		} else {
			this.setData({

				_params: {
					sortType: 'cateId',
					sortVal: '',
				}
			});
		}
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () { },

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: async function () {
        ProjectBiz.syncTabBar(this, 1);

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
        const points=[{x:27,y:24},{x:60,y:33},{x:39,y:49},{x:71,y:61},{x:23,y:70},{x:58,y:80}];
        const list=((e.detail.dataList||e.detail.data||{}).list||((this.data.dataList||{}).list)||[]).map(i=>normalizeContent(i,'spot')).filter(i=>i.id);
        const guideItems=list.slice(0,6).map((item,index)=>({...item,...points[index]}));
        this.setData({guideItems,selected:guideItems.find(i=>this.data.selected&&i.id===this.data.selected.id)||guideItems[0]||null});
	},


	onShareAppMessage: function () {

	},

    bindMapMode(){this.setData({mapMode:!this.data.mapMode});},
    bindPin(e){this.setData({selected:this.data.guideItems.find(i=>i.id===e.currentTarget.dataset.id)||null});},
    bindZoom(){this.setData({mapScale:this.data.mapScale===1?1.45:1});},
    bindReset(){this.setData({mapScale:1});},
    bindGuideTab(e){this.setData({guideTab:e.currentTarget.dataset.tab});},
	_getSearchMenu: function () {
		SpotBiz.setCateTitle();

		let sortItem1 = [{ label: '全部', type: 'cateId', value: '' }];

		sortItem1 = sortItem1.concat(SpotBiz.getCateList());

		let sortItems = [
			{ label: '排序', type: '', value: '' },
			{ label: '最新', type: 'sort', value: 'SPOT_ADD_TIME|desc' },
			{ label: '最热', type: 'sort', value: 'SPOT_VIEW_CNT|desc' },
			{ label: '推荐指数', type: 'sort', value: 'SPOT_OBJ.star|desc' },
		];
		let sortMenus = sortItem1;

		this.setData({
			sortItems: [sortItems],
			sortMenus
		})

	}

})
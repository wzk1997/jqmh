const pageHelper = require('../../../../../helper/page_helper.js');
const cloudHelper = require('../../../../../helper/cloud_helper.js');
const { normalizeContent } = require('../../../ui/content_ui.js');
const sceneConfig = require('../../../ui/scene_config.js');
const ProjectBiz = require('../../../biz/project_biz.js');
const homePreview = require('../../../ui/home_preview.js');
const settings = require('../../../../../setting/setting.js');


Page({
    bindScenicLayout(e) { this.setData({uiChrome:e.detail}); },
	/**
	 * 页面的初始数据
	 */
	data: {mediaUrls:{},
        homeNavMode:'home',portalBrandName:'江纺1953',
        heroRender:true,heroLoading:true,heroImagesLoaded:{},heroImageErrors:{},scenicAboutUrl:'/projects/TRIP1/pages/about/index/about_index',
        heroIndex: 0,
        heroImage: sceneConfig.heroImage,
        heroPlaying: true,
        heroSlides: [],
        waterfallItems: [],
        homeNewsLimit: 6,
        hot1List: [],
        hot2List: [],
        newsList: [],
        noticeTitle: '',
        contentGroups: [],
        homeLoading: false,
        hasHomeLoaded: false,
        homeError: false,
        homeUiPreview: false,

		album: [
			'/projects/TRIP1/images/town/courtyard-v1.jpg',
			'/projects/TRIP1/images/town/street-v1.jpg',
			'/projects/TRIP1/images/town/night-v1.jpg',
			'/projects/TRIP1/images/town/courtyard-v1.jpg',
		]
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: async function (options) {
		ProjectBiz.initPage(this, { isSetNavColor: false });

	},

    onPageScroll(e){const mode=e.scrollTop>80?'page':'home';if(mode!==this.data.homeNavMode)this.setData({homeNavMode:mode});},
    bindAllNews() { wx.navigateTo({url:'/projects/TRIP1/pages/news/index/news_index?layout=waterfall'}); },
    bindHeroChange: function (e) {
        const index=Number(e.detail.current);
        if(Number.isInteger(index)&&index>=0&&index<this.data.heroSlides.length)this.setData({heroIndex:index});
    },

    referenceUrl(ref){
        if(!ref)return '';
        const root='/projects/TRIP1/pages/';
        const routes={scenic:'about/index/about_index',merchant:'about/merchant/merchant_detail'};
        return root+(routes[ref.module]||ref.module+'/detail/'+ref.module+'_detail')+'?id='+encodeURIComponent(ref.id);
    },
    applyPortal(portal){
        const slides=(portal.slides||[]).map(row=>({...row,label:row.title,path:this.referenceUrl(row.target)}));
        this.setData({portalBrandName:portal.brandName||'江纺1953',heroLoading:false,heroImagesLoaded:{},heroImageErrors:{},heroSlides:slides.length?slides:[{image:sceneConfig.heroImage,label:'江纺1953',subtitle:'拾光小镇 · 开启一段好时光'}],heroIndex:0});
    },
    retryHero(){this.setData({heroRender:false,heroImagesLoaded:{},heroImageErrors:{}});wx.nextTick(()=>this.setData({heroRender:true}));},
    heroImageLoaded(e){const index=e.currentTarget.dataset.index;this.setData({['heroImagesLoaded.'+index]:true,['heroImageErrors.'+index]:false});},
    heroImageError(e){this.setData({['heroImageErrors.'+e.currentTarget.dataset.index]:true});},
    heroTap(e){const slide=this.data.heroSlides[e.currentTarget.dataset.index];if(slide&&slide.path)wx.navigateTo({url:slide.path});},
    _loadList: async function () {
        if (this.data.homeLoading) return;
        if (homePreview.isEnabled && homePreview.isEnabled(wx, settings)) {
            this.applyPortal(homePreview.portal);
            this.setData({homeUiPreview:true,homeLoading:false,homeError:false,hasHomeLoaded:true,waterfallItems:homePreview.news.map(item=>normalizeContent(item,'news'))});
            return;
        }
        this.setData({ homeLoading: true, homeUiPreview: false });
        try {
            const results = await Promise.allSettled([
                cloudHelper.callCloudSumbit('home/portal', {}, {hint:false}),
                cloudHelper.callCloudSumbit('news/list', {cateGroup:'scenic',page:1,size:this.data.homeNewsLimit}, {title:'bar'})
            ]);
            const portal=results[0].status==='fulfilled'?results[0].value.data:null;
            this.applyPortal(portal&&portal.configured?portal:{slides:[]});
            const latest=results[1].status==='fulfilled'?((results[1].value.data||{}).list||[]):[];
            this.setData({hasHomeLoaded:true,homeError:results[1].status==='rejected',waterfallItems:latest.map(item=>normalizeContent(item,'news')).slice(0,this.data.homeNewsLimit)});
        } catch (err) {
            this.setData({ homeError: true });
        } finally {
            this.setData({ homeLoading: false });
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
        ProjectBiz.syncTabBar(this, 0);
        this.setData({heroPlaying:true});
		if (!this.data.hasHomeLoaded) await this._loadList();
	},

	onPullDownRefresh: async function () {
		await this._loadList();
		wx.stopPullDownRefresh();
	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {
        this.setData({heroPlaying:false});
	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {
        this.setData({heroPlaying:false});
	},

	url: async function (e) {
		pageHelper.url(e, this);
	},


	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {

	},
})

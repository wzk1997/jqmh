const pageHelper = require('../../../../../helper/page_helper.js');
const cloudHelper = require('../../../../../helper/cloud_helper.js');
const { normalizeContent, mergeContent } = require('../../../ui/content_ui.js');
const sceneConfig = require('../../../ui/scene_config.js');
const ProjectBiz = require('../../../biz/project_biz.js');

Page({
    bindScenicLayout(e) { this.setData({uiChrome:e.detail}); },
	/**
	 * 页面的初始数据
	 */
	data: {mediaUrls:{},
        homeNavMode:'home',
        heroRender:true,heroImagesLoaded:{},heroImageErrors:{},portalFeatured:[],practical:[],scenicAboutUrl:'/projects/TRIP1/pages/about/index/about_index',
        heroIndex: 0,
        heroImage: sceneConfig.heroImage,
        heroPlaying: true,
        heroSlides: [
            { image: sceneConfig.heroImage, label: '山水相伴', subtitle: '探索自然 · 感受生活 · 从这里出发' },
            { image: '/projects/TRIP1/images/home/b3.jpg', label: '漫步青山', subtitle: '放慢脚步 · 发现旅途中的美好' },
            { image: '/projects/TRIP1/images/design/ar-forest-v3.jpg', label: '林间有清风', subtitle: '绿意相随 · 开启自在旅程' },
            { image: '/projects/TRIP1/images/home/b5.jpg', label: '遇见星光', subtitle: '山水之间 · 收藏每一刻风景' }
        ],
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
        services: [
            { title: '美食餐饮', icon: 'icon-shop', url: '../../news/index/news_index?id=2' },
            { title: '地方特产', icon: 'icon-goodsnew', url: '../../news/index/news_index?id=3' },
            { title: '星级导游', icon: 'icon-discover', url: '../../about/index/about_index?key=SETUP_CONTENT_DY' },
            { title: '公交信息', icon: 'icon-location', url: '../../about/index/about_index?key=SETUP_CONTENT_BUS' },
            { title: '停车场', icon: 'icon-ticket', url: '../../about/index/about_index?key=SETUP_CONTENT_PARKING' },
            { title: '找厕所', icon: 'icon-service', url: '../../about/index/about_index?key=SETUP_CONTENT_TOLIET' },
            { title: '一周天气', icon: 'icon-info', url: '../../about/index/about_index?key=SETUP_CONTENT_WEATHER' },
            { title: '客户反馈', icon: 'icon-edit', url: '../../feedback/index/feedback_index' }
        ],
		album: [
			'/projects/TRIP1/images/home/b3.jpg',
			'/projects/TRIP1/images/home/b1.jpg',
			'/projects/TRIP1/images/home/b4.jpg',
			'/projects/TRIP1/images/home/b5.jpg',
		]
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: async function (options) {
		ProjectBiz.initPage(this, { isSetNavColor: false });

	},

    onPageScroll(e){const mode=e.scrollTop>200?'page':'home';if(mode!==this.data.homeNavMode)this.setData({homeNavMode:mode});},
    bindAllNews() { wx.navigateTo({url:'/projects/TRIP1/pages/news/index/news_index?layout=waterfall&id=1'}); },
    bindHeroChange: function (e) {
        this.setData({ heroIndex: e.detail.current });
    },

    referenceUrl(ref){
        if(!ref)return '';
        const root='/projects/TRIP1/pages/';
        const routes={scenic:'about/index/about_index',merchant:'about/merchant/merchant_detail',panorama:'experience/panorama/panorama_index'};
        return root+(routes[ref.module]||ref.module+'/detail/'+ref.module+'_detail')+'?id='+encodeURIComponent(ref.id);
    },
    applyPortal(portal){
        const scenic=portal.scenic,info=scenic&&scenic.SCENIC_INFO||{};
        const slides=(portal.slides||[]).map(row=>({...row,label:row.title,path:this.referenceUrl(row.target)}));
        const featured=(portal.featured||[]).map(row=>{
            const module=row.type||Object.keys(row).find(k=>/_NAME$/.test(k))?.split('_')[0].toLowerCase();
            if(!module)return null;
            const p=module.toUpperCase()+'_',id=row.id||row._id;
            return {id,title:row.title||row[p+'NAME'],desc:row.desc||row[p+'DESC']||'',pic:row.pic||(row[p+'IMAGES']||row[p+'COVER']||[])[0]||'',demo:!!(row.demo||row[p+'DEMO']),path:this.referenceUrl({module,id})};
        }).filter(Boolean);
        const practical=[{title:'开放时间',text:scenic&&scenic.SCENIC_HOURS,icon:'time'},{title:'景区地址',text:scenic&&scenic.SCENIC_ADDRESS,icon:'location'},{title:'交通指南',text:[info.selfDrive,info.transit].filter(Boolean).join(' / '),icon:'taxi'},{title:'游客服务',text:info.services||info.centerService,icon:'service'},{title:'建议游玩时长',text:info.visitDuration,icon:'time'},{title:'温馨提示',text:info.tips,icon:'info'}].filter(row=>row.text);
        this.setData({heroImagesLoaded:{},heroImageErrors:{},portalFeatured:featured,portalScenic:scenic,practical,scenicAboutUrl:scenic?this.referenceUrl({module:'scenic',id:scenic._id}):this.data.scenicAboutUrl,heroSlides:slides.length?slides:[{image:sceneConfig.heroImage,label:'自然为伴',subtitle:'探索自然 · 美好出发'}],heroIndex:0});
    },
    retryHero(){this.setData({heroRender:false,heroImagesLoaded:{},heroImageErrors:{}});wx.nextTick(()=>this.setData({heroRender:true}));},
    heroImageLoaded(e){this.setData({['heroImagesLoaded.'+e.currentTarget.dataset.index]:true});},
    heroImageError(e){this.setData({['heroImageErrors.'+e.currentTarget.dataset.index]:true});},
    heroTap(e){const slide=this.data.heroSlides[e.currentTarget.dataset.index];if(slide&&slide.path)wx.navigateTo({url:slide.path});},
    _loadList: async function () {
        if (this.data.homeLoading) return;
        this.setData({ homeLoading: true, homeError: false });
        try {
            const results = await Promise.allSettled([
                cloudHelper.callCloudSumbit('home/portal', {}, {hint:false}),
                cloudHelper.callCloudSumbit('news/list', {cateGroup:'scenic',page:1,size:this.data.homeNewsLimit}, {title:'bar'})
            ]);
            const portal=results[0].status==='fulfilled'?results[0].value.data:null;
            let recommendations=[];
            if(portal&&portal.configured){this.applyPortal(portal);recommendations=portal.featured||[];}
            else {const res=await cloudHelper.callCloudSumbit('home/list', {}, {title:'bar'});recommendations=Array.isArray(res.data)?res.data:[];}
            const newsList=recommendations.filter(item=>item.type==='news');
            const latest=results[1].status==='fulfilled'?((results[1].value.data||{}).list||[]):[];
            this.setData({newsList,hasHomeLoaded:true,homeError:results[1].status==='rejected',waterfallItems:mergeContent(latest.map(item=>normalizeContent(item,'news')),newsList.map(item=>normalizeContent(item,'news'))).slice(0,this.data.homeNewsLimit)});
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
		this._loadList();
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

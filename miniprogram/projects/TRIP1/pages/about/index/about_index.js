const behavior = require('../../../../../comm/behavior/about_bh.js');
const cloudHelper = require('../../../../../helper/cloud_helper.js');
const ProjectBiz = require('../../../biz/project_biz.js');
const projectSetting = require('../../../public/project_setting.js');

Page({
    data:{navMode:'immersive',activeSection:0,tabs:['概况','特色亮点','自然人文','景区相册','实用信息'],galleryFilter:'全部',gallery:[],galleryCategories:['全部'],displayGallery:[],info:{}},
    prepareScenic(record){
        const info=record&&record.SCENIC_INFO||{},images=record&&record.SCENIC_IMAGES||[];
        const sections=['highlights','reasons','nature','culture'].map(key=>({key,items:(info[key]||[]).map(card=>({...card,image:images[card.imageIndex-1]||''}))}));
        const gallery=images.map((image,index)=>({image,category:(info.galleryTags||[])[index]||'风景'}));
        const seasonNames={spring:'春',summer:'夏',autumn:'秋',winter:'冬'};
        const seasons=(info.seasons||[]).map(item=>({...item,label:seasonNames[item.season],image:images[item.imageIndex-1]||''}));
        const facts=[{value:info.rating,label:'景区等级'},{value:info.altitude,label:'海拔'},{value:info.history,label:'人文历史'}].filter(item=>item.value);
        const traffic=[{title:'自驾',text:info.selfDrive},{title:'公共交通',text:info.transit},{title:'停车信息',text:info.parking}].filter(item=>item.text);
        const serviceItems=[{key:'centerService',title:'游客中心',icon:'location'},{key:'toiletService',title:'卫生间',icon:'service'},{key:'restService',title:'休息区',icon:'home'},{key:'foodService',title:'餐饮服务',icon:'shop'}].filter(item=>info[item.key]).map(item=>({...item,desc:info[item.key]}));
        this.setData({info,sections,seasons,facts,traffic,serviceItems,gallery,displayGallery:gallery,galleryFilter:'全部',galleryCategories:['全部',...new Set(gallery.map(item=>item.category))],mapMarkers:typeof info.latitude==='number'&&typeof info.longitude==='number'?[{id:1,latitude:info.latitude,longitude:info.longitude,title:record.SCENIC_NAME,width:28,height:36}]:[]});
    },
    onPageScroll(e){
        const mode=e.scrollTop>250?'page':'immersive';if(mode!==this.data.navMode)this.setData({navMode:mode});
        if(this._scrollPending)return;this._scrollPending=true;
        wx.createSelectorQuery().in(this).selectAll('.scenic-section').boundingClientRect(rects=>{this._scrollPending=false;if(!rects)return;let active=0;const top=(this.data.uiChrome&&this.data.uiChrome.height||88)+60;rects.forEach((rect,index)=>{if(rect.top<=top)active=index;});if(active!==this.data.activeSection)this.setData({activeSection:active});}).exec();
    },
    section(e){const index=Number(e.currentTarget.dataset.index);wx.createSelectorQuery().in(this).select('#section-'+index).boundingClientRect().selectViewport().scrollOffset().exec(res=>{if(res[0]&&res[1])wx.pageScrollTo({scrollTop:Math.max(0,res[0].top+res[1].scrollTop-(this.data.uiChrome&&this.data.uiChrome.height||88)-52),duration:300});});},
    filterGallery(e){const filter=e.currentTarget.dataset.filter;this.setData({galleryFilter:filter,displayGallery:filter==='全部'?this.data.gallery:this.data.gallery.filter(item=>item.category===filter)});},
    preview(e){const current=e.currentTarget.dataset.src,media=require('../../../../../helper/media_helper.js');const urls=this.data.gallery.map(item=>item.image).includes(current)?this.data.gallery.map(item=>item.image):[current];wx.previewImage({current:media.display(current,this.data.mediaUrls),urls:urls.map(id=>media.display(id,this.data.mediaUrls))});},
    showService(e){const item=this.data.serviceItems[Number(e.currentTarget.dataset.index)];if(item)wx.showModal({title:item.title,content:item.desc,showCancel:false,confirmText:'知道了',confirmColor:'#146C60'});},
    copyAddress(){wx.setClipboardData({data:this.data.scenicRecord.SCENIC_ADDRESS});},
    openMap(){const info=this.data.info;if(typeof info.latitude==='number'&&typeof info.longitude==='number')wx.openLocation({latitude:info.latitude,longitude:info.longitude,name:this.data.scenicRecord.SCENIC_NAME,address:this.data.scenicRecord.SCENIC_ADDRESS||'',scale:15});},

    bindScenicLayout(e) { this.setData({uiChrome:e.detail}); },

	behaviors: [behavior],

	/**
		* 生命周期函数--监听页面加载
		*/
	onLoad: async function (options) {
		ProjectBiz.initPage(this);

        if(options&&options.adminPreview==='1'){const AdminBiz=require('../../../../../comm/biz/admin_biz.js');if(!AdminBiz.isAdmin(this))return;this.setData({adminPreview:true,previewId:options.id||''});}
        this.setData({scenicId:!this.data.adminPreview&&options&&options.id||''});
        const contentKey = options && options.key ? options.key : 'SETUP_CONTENT_ABOUT';
        const contentItem = projectSetting.SETUP_CONTENT_ITEMS.find(item => item.key === contentKey);
        this.setData({ contentKey, contentTitle: contentItem ? contentItem.title : '景区信息', isScenicAbout: contentKey === 'SETUP_CONTENT_ABOUT' });
        await this.loadAbout();
        if(options&&/^[0-4]$/.test(options.section||''))wx.nextTick(()=>this.section({currentTarget:{dataset:{index:Number(options.section)}}}));
	},

    async loadAbout(){
        const key=this.data.contentKey;
        if(this.data.adminPreview){try{const record=await require('../../../ui/cms_ui.js').call('detail',{module:'scenic',id:this.data.previewId});this.prepareScenic(record);this.setData({about:record.SCENIC_CONTENT||[],isLoad:true,scenicRecord:record,previewError:false});}catch(_){this.setData({isLoad:true,previewError:true});}return;}
        if(key==='SETUP_CONTENT_ABOUT'){
            const result=await cloudHelper.callCloudSumbit(this.data.scenicId?'cms/detail':'cms/list',this.data.scenicId?{module:'scenic',id:this.data.scenicId}:{module:'scenic',page:1,size:1},{hint:false}).catch(()=>null);
            const record=this.data.scenicId?result&&result.data:result && result.data && result.data.list && result.data.list[0];
            if(record){this.prepareScenic(record);this.setData({about:record.SCENIC_CONTENT,isLoad:true,scenicRecord:record});return;}
        }
        this.prepareScenic(null);this.setData({scenicRecord:null});await this._loadDetail(key,projectSetting.SETUP_CONTENT_ITEMS);
    },
    bindExpand(){this.setData({expanded:!this.data.expanded});},
    onShareAppMessage(){return {title:this.data.adminPreview?'WeTravel · 景区简介':this.data.scenicRecord&&this.data.scenicRecord.SCENIC_NAME||'WeTravel · 景区简介',path:'/projects/TRIP1/pages/about/index/about_index'+(!this.data.adminPreview&&this.data.scenicRecord&&this.data.scenicRecord._id?'?id='+encodeURIComponent(this.data.scenicRecord._id):'')};},
    onPullDownRefresh: async function () {
        try { await this.loadAbout(); }
        finally { wx.stopPullDownRefresh(); }
    }
})

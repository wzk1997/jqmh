const cloudHelper=require('../../../../../helper/cloud_helper.js');
const behavior=require('../../../../../comm/behavior/news_index_bh.js');
const pageHelper=require('../../../../../helper/page_helper.js');
const ProjectBiz=require('../../../biz/project_biz.js');
const projectSetting=require('../../../public/project_setting.js');
const {normalizeContent,filterNews}=require('../../../ui/content_ui.js');
Page({
    bindScenicLayout(e) { this.setData({uiChrome:e.detail}); },behaviors:[behavior],data: {mediaUrls:{},newsPageSize:20,newsFacet:'all',visibleNews:[],activityFilters:[{label:'全部',value:'all'}]},
 onLoad(options){ProjectBiz.initPage(this);this.setData({waterfallLayout:options.layout==='waterfall',newsFacet:'all'});this._setCate(projectSetting.NEWS_CATE,options);this.setData({_params:{...this.data._params,size:this.data.newsPageSize,...(this.data.newsCategory==='1'?{cateId:'0',cateGroup:'scenic'}:{})}});if(this.data.waterfallLayout)this.setData({newsHeading:'景区资讯'});wx.setNavigationBarTitle({title:this.data.newsHeading});this.loadCategories();},
 async loadCategories(){if(!cloudHelper.callCloudSumbit)return;try{const res=await cloudHelper.callCloudSumbit('cms/categories',{module:'news'},{hint:false});const categories=res.data.map(c=>({id:c.id,title:c.name}));this.setData({activityFilters:[{label:'全部',value:'all'}].concat(categories.map(c=>({label:c.title,value:c.id}))),newsCateList:categories,newsFilters:[{label:'全部',value:'0'}].concat(categories.map(c=>({label:c.title,value:c.id})))});}catch(_){}},
 bindCommListCmpt(e){pageHelper.commListListener(this,e);this.filterContent();},
 bindNewsCategory(e){if(this.data.newsCategory==='1'){this.setData({newsFacet:e.detail.value});this.filterContent();}else{this._setCate(this.data.newsCateList,{},e.detail.value);this.setData({_params:{...this.data._params,size:this.data.newsPageSize}});}},
 filterContent(){const list=((this.data.dataList||{}).list||[]).map(i=>normalizeContent(i,'news'));this.setData({visibleNews:this.data.newsCategory==='1'?filterNews(list,this.data.newsFacet):list});}
});

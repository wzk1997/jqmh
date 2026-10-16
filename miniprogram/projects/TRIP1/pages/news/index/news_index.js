const cloudHelper=require('../../../../../helper/cloud_helper.js');
const behavior=require('../../../../../comm/behavior/news_index_bh.js');
const pageHelper=require('../../../../../helper/page_helper.js');
const ProjectBiz=require('../../../biz/project_biz.js');
const {normalizeContent}=require('../../../ui/content_ui.js');
Page({
 bindScenicLayout(e){this.setData({uiChrome:e.detail});},
 behaviors:[behavior],
 data:{mediaUrls:{},newsPageSize:20,newsCategory:'0',newsHeading:'活动资讯',newsSubtitle:'了解江纺动态，发现小镇活动',visibleNews:[],newsFilters:[{label:'全部',value:'0'}],categoriesLoading:false,categoriesError:false},
 onLoad(options={}){
  ProjectBiz.initPage(this);
  this.requestedCategory=String(options.id||'0');
  this.setData({waterfallLayout:options.layout==='waterfall'});
  return this.loadCategories();
 },
 onShow(){if(this.categoriesReady)return this.loadCategories();},
 async loadCategories(){
  if(this.data.categoriesLoading)return;
  this.setData({categoriesLoading:true,categoriesError:false});
  try{
   const res=await cloudHelper.callCloudSumbit('cms/categories',{module:'news'},{hint:false});
   if(!res||!Array.isArray(res.data))throw Error('分类返回异常');
   const categories=res.data.map(c=>({id:String(c.id),title:c.name}));
   const wasReady=this.categoriesReady;
   const previousIds=JSON.stringify((this.data.newsCateList||[]).map(c=>c.id));
   const previousSelection=this.data.newsCategory;
   const selected=this.categoriesReady?this.data.newsCategory:this.requestedCategory;
   const id=categories.some(c=>c.id===selected)?selected:'0';
   this.setData({newsCateList:categories,newsFilters:[{label:'全部',value:'0'}].concat(categories.map(c=>({label:c.title,value:c.id})))});
   this.categoriesReady=true;
   this.selectCategory(id);
   this.filterContent();
   if(wasReady&&previousSelection===id&&previousIds!==JSON.stringify(categories.map(c=>c.id))){
    const list=this.selectComponent&&this.selectComponent('#newsList');
    if(list)await list.reload();
   }
  }catch(_){this.setData({categoriesError:true});}
  finally{this.setData({categoriesLoading:false});}
 },
 selectCategory(id){
  const selected=(this.data.newsCateList||[]).find(c=>c.id===id);
  if(id!=='0'&&!selected)return;
  const params={cateId:id,cateGroup:'scenic',size:this.data.newsPageSize};
  const changed=JSON.stringify(params)!==JSON.stringify(this.data._params);
  this.setData({newsCategory:id,newsHeading:selected?selected.title:'活动资讯',...(changed?{_params:params,visibleNews:[],dataList:null}:{})});
  wx.setNavigationBarTitle({title:this.data.newsHeading});
 },
 bindNewsCategory(e){this.selectCategory(String(e.detail.value));},
 bindCommListCmpt(e){pageHelper.commListListener(this,e);this.filterContent();},
 filterContent(){this.setData({visibleNews:((this.data.dataList||{}).list||[]).filter(i=>(this.data.newsCateList||[]).some(c=>c.id===String(i.cateId||i.NEWS_CATE_ID))).map(i=>{const category=(this.data.newsCateList||[]).find(c=>c.id===String(i.cateId||i.NEWS_CATE_ID));return normalizeContent({...i,...(category?{cateName:category.title}:{} )},'news');})});}
});

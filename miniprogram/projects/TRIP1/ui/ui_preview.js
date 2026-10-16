// Development-tool fixtures. No database, uploads, or production API fallback.
const home = require('./home_preview.js');
const image = name => '/projects/TRIP1/images/' + name;
const text = val => ({type:'text',val});
const photo = val => ({type:'img',val});
const pictures = ['town/street-v1.jpg','town/courtyard-v1.jpg','town/night-v1.jpg','town/street-v1.jpg','town/night-v1.jpg','town/courtyard-v1.jpg'].map(image);
const products = ['街区入口（示例）','小镇步行街（示例）','休闲空间（示例）','江纺故事空间（示例）','街角休憩区（示例）','小镇打卡点（示例）'].map((title,i)=>({
    _id:'ui-spot-'+i, PRODUCT_TITLE:title, PRODUCT_CATE_ID:String(i%3+1), PRODUCT_CATE_NAME:['街区漫游','休闲生活','小镇体验'][i%3], PRODUCT_DEMO:true, PRODUCT_VIEW_CNT:120+i*37,
    PRODUCT_OBJ:{cover:[pictures[i]],album:[pictures[i],pictures[(i+1)%6]],subtitle:'慢下来，发现小镇里的日常美好',desc:title+'用于展示小镇去处的页面效果。可以在这里查看街区介绍与逛镇提示。\n\n具体地点、开放信息与服务以实际配置为准。图文及路线信息均为本地 UI 演示。',address:'演示园区 · '+['街区区域','休闲区域','生活区域'][i%3],distance:(0.3+i*0.4).toFixed(1)+' km',duration:(20+i*10)+' 分钟',bestTime:'清晨 / 傍晚',time:'08:00—18:00',traffic:'出行方式与通行安排以小镇实际公示为准。',other:'建议穿舒适的步行鞋，自备饮水，爱护街区环境。示例路线不用于实际导航。'}
}));
const albums = ['小镇初访半日游','亲子逛镇体验线','江纺街区慢行线','小镇悠闲一日游','美食寻味之旅','小镇周末休闲','小镇伴手礼指南','雨天悠闲游'].map((title,i)=>{
    const spots=[products[i%6],products[(i+1)%6],products[(i+2)%6]];
    return {_id:'ui-route-'+i,ALBUM_TITLE:title,ALBUM_CATE_ID:i<4?'1':String(i-2),ALBUM_CATE_NAME:i<4?'经典路线':['吃喝','住宿','购物','其他'][i-4],ALBUM_DEMO:true,ALBUM_DURATION:i%2?'约 4 小时':'约 2 小时',ALBUM_VIEW_CNT:238+i*23,ALBUM_ADD_TIME:'2026-10-'+String(16-i).padStart(2,'0'),ALBUM_ORDER:i,
        ALBUM_OBJ:{cover:[pictures[i%6]],desc:'串联园区特色，轻松体验'+title+'。',spots:spots.map(s=>s._id),detail:[text('串联小镇街区、休闲空间与吃喝逛玩体验。示例路线用于预览排版，实际行程请以已配置的地点和现场开放情况为准。'),photo(pictures[i%6]),text('出行贴士：备好饮水与舒适鞋履，根据天气调整行程。以上均为本地示例，不代表真实开放或服务信息。')]},ALBUM_SPOTS:spots.map((s,n)=>({...s,cover:s.PRODUCT_OBJ.cover[0],duration:'约 30 分钟',note:'第 '+(n+1)+' 站 · 沿街区漫游',highlight:s.PRODUCT_TITLE}))};
});
const tipGuides = ['逛镇前的准备（示例）','小镇休闲安排（示例）'].map((title,i)=>({
    _id:'ui-album-tip-'+i,ALBUM_SPOTS:[],ALBUM_TITLE:title,ALBUM_CATE_ID:'tips',ALBUM_CATE_NAME:'游玩贴士',ALBUM_DEMO:true,ALBUM_ORDER:i,ALBUM_VIEW_CNT:0,ALBUM_ADD_TIME:'2026-10-16',
    ALBUM_OBJ:{cover:[pictures[i]],desc:'安排小镇行程前，了解实用的逛镇建议。',spots:[],detail:[text('本内容为独立的攻略贴士示例。出行前核实开放安排，按需安排休闲与用餐时间，注意保管随身物品。具体服务信息以小镇实际公示为准。')]}
}));
albums.push(...tipGuides);
const categories = {
    album:[['1','经典路线'],['2','吃喝'],['3','住宿'],['4','购物'],['5','其他'],['tips','游玩贴士']],
    product:[['1','街区漫游'],['2','休闲生活'],['3','小镇体验']],
    news:[['activity','活动资讯'],['announcement','园区公告'],['tips','游玩贴士'],['culture','人文故事'],['2','特色美食'],['3','地方特产']],
    merchant:[['food','美食'],['stay','住宿'],['travel','出行']]
};
const news = home.news.map((n,i)=>({...n,_id:n.id,NEWS_TITLE:n.title,NEWS_DESC:n.desc,NEWS_CATE_ID:i===3?'culture':n.cateId,NEWS_CATE_NAME:n.activityStart?'活动资讯':i===3?'人文故事':'游玩贴士',NEWS_PIC:[n.pic],NEWS_DEMO:true,NEWS_VIEW_CNT:n.views,NEWS_ADD_TIME:n.publishDate||'2026-10-16',NEWS_ACTIVITY_START:n.activityStart||'',NEWS_ACTIVITY_END:n.activityEnd||'',NEWS_CONTENT:[text(n.desc),photo(n.pic),text('在小镇走走停停，发现街边小店、休闲去处与相聚的乐趣。欢迎和家人朋友一起探索江纺1953·拾光小镇。\n\n本内容为本地 UI 预览示例，活动安排、时间和图片均不代表实际运营信息。')]}));
[['announcement','园区秋季游览温馨提示','出发前请关注天气，合理安排游览时间。'],['2','小镇寻味指南','逛逛小镇，寻找喜欢的餐饮与休闲去处。'],['3','把小镇好物带回家','发现小店好物与手作伴手礼。']].forEach(([category,title,desc],i)=>news.push({_id:'ui-news-extra-'+i,NEWS_TITLE:title,NEWS_DESC:desc,NEWS_CATE_ID:category,NEWS_CATE_NAME:categories.news.find(c=>c[0]===category)[1],NEWS_PIC:[pictures[(i+1)%6]],NEWS_DEMO:true,NEWS_VIEW_CNT:88,NEWS_ADD_TIME:'2026-10-16',NEWS_CONTENT:[text(desc),photo(pictures[(i+1)%6]),text('本地界面演示内容，不代表真实商品、服务或开放安排。')]}));
const merchants = [];
const merchantNames={food:['街区小馆（示例）','小镇轻食（示例）','街角茶歇（示例）'],stay:['周边住宿A（示例）','周边住宿B（示例）','周边住宿C（示例）'],travel:['游客中心停车场','园区接驳站','慢行租赁服务']};
Object.keys(merchantNames).forEach(category=>merchantNames[category].forEach((name,i)=>merchants.push({_id:'ui-merchant-'+category+'-'+i,MERCHANT_NAME:name,MERCHANT_CATEGORY:category,MERCHANT_DESC:{food:'逛镇途中歇歇脚，寻找喜欢的日常风味。',stay:'查看周边住宿信息，安排休闲行程。',travel:'为园区游览提供便利的出行配套。'}[category],MERCHANT_IMAGES:[pictures[(i+(category==='stay'?2:0))%6]],MERCHANT_ADDRESS:'演示园区 · 游客服务区',MERCHANT_PHONE:'',MERCHANT_HOURS:'09:00—18:00（示例）',MERCHANT_DEMO:true,MERCHANT_CONTENT:[text('本条为本地界面演示服务，图片使用现有园区素材，不代表真实商家。不提供实际预订、联系或交易。')]})));
const scenic={_id:'ui-scenic',SCENIC_NAME:'江纺1953·拾光小镇',SCENIC_DESC:'走进江纺1953·拾光小镇，发现街区漫游与日常生活的更多可能。',SCENIC_IMAGES:pictures.slice(0,4),SCENIC_DEMO:true,SCENIC_HOURS:'08:00—18:00（示例）',SCENIC_ADDRESS:'江西省南昌市青山湖区江纺厂前1号楼',SCENIC_CONTENT:[text('江纺1953·拾光小镇位于江西省南昌市青山湖区江纺厂前1号楼。在这里安排一段逛镇时光，探索街区、休闲和生活体验。此段为本地展示文案，具体业态与开放安排以实际运营信息为准。'),photo(pictures[1]),text('和家人朋友一起逛逛街区，记录相聚的好时光。商家、活动与配套信息均为本地 UI 预览示例。')],SCENIC_INFO:{tagline:'拾光小镇 · 美好日常',rating:'',altitude:'',history:'',visitDuration:'建议安排半天至一天',highlights:[{title:'街区漫游',desc:'走进街区角落，发现值得停留的小镇空间。',imageIndex:1},{title:'拾光慢生活',desc:'逛逛小店，给自己留一段悠闲时光。',imageIndex:2},{title:'小镇相聚',desc:'和家人朋友一起，记录日常相聚的时刻。',imageIndex:3}],selfDrive:'导航至园区游客中心后步行入园（演示说明）。',transit:'在游客服务中心了解公共交通与接驳安排。',parking:'游客中心设停车服务区，具体以现场公示为准。',tips:'文明游览，爱护环境；以上信息均为本地演示，请勿用于实际出行。'}};
const services=[{_id:'ui-service-parking',SERVICE_NAME:'停车指引（演示）',SERVICE_DESC:'本地界面预览，不代表实际停车信息',SERVICE_IMAGES:[],SERVICE_CONTENT:[text('此内容仅用于本地服务页面预览，请在后台配置真实信息。')]}];
const modules={service:services,product:products,album:albums,news,merchant:merchants,scenic:[scenic]};
const setup={BUS:'公共交通\n可在游客中心了解公交及接驳路线。发车时间以现场信息为准。',PARKING:'停车服务\n游客中心设有停车区，请按现场指引停放，勿占用消防通道。',TOLIET:'公共卫生间\n公共卫生间位置请以小镇现场导视与实际公示为准。',LXS:'旅行服务\n团队游览可前往游客服务中心咨询行程与配套服务。',DY:'导游服务\n可在游客中心咨询小镇介绍与逛镇服务。',WEATHER:'天气示例\n周五 晴 18—26℃\n周六 多云 17—25℃\n周日 晴 18—27℃\n\n此处仅演示排版，不是实时天气。'};
function list(module,params){
    if(!modules[module])throw new Error('未知预览模块');
    let rows=modules[module].slice();const prefix=module.toUpperCase();
    const category=params.category||params.cateId||(params.sortType==='cateId'?params.sortVal:'');
    if(category&&String(category)!=='0')rows=rows.filter(r=>String(r[prefix+(module==='merchant'?'_CATEGORY':'_CATE_ID')])===String(category));
    if(params.search)rows=rows.filter(r=>JSON.stringify(r).includes(String(params.search)));
    if(params.orderBy)for(const key of Object.keys(params.orderBy).reverse())rows.sort((a,b)=>{const x=a[key],y=b[key];return (x>y?1:x<y?-1:0)*(params.orderBy[key]==='desc'?-1:1);});
    const page=Math.max(1,Number(params.page)||1),size=Math.max(1,Math.min(100,Number(params.size)||20));
    return {list:rows.slice((page-1)*size,page*size),total:rows.length,page,size,count:Math.ceil(rows.length/size),oldTotal:rows.length};
}
function respond(route,params={}){
    let data;
    const [module,action]=route.split('/');
    if(route==='home/portal')data=home.portal;
    else if(route==='home/setup_get')data=[text((setup[String(params.key).replace('SETUP_CONTENT_','')]||'游客服务信息')+'\n\n本内容仅供本地 UI 预览。')];
    else if(route==='cms/categories')data=(categories[params.module]||[]).map(([id,name])=>({id,name}));
    else if(route==='cms/list'||action==='list'&&modules[module])data=list(route==='cms/list'?params.module:module,params);
    else if(route==='cms/detail'||action==='view'&&modules[module]){data=(modules[route==='cms/detail'?params.module:module]||[]).find(r=>r._id===params.id);if(!data)throw new Error('预览内容不存在');}
    else if(route==='feedback/submit')data={id:'local-preview-feedback'};
    else if(route==='feedback/upload')data={fileID:'local-preview-image'};
    else throw new Error('本地 UI 预览模式不调用该接口：'+route);
    return JSON.parse(JSON.stringify({code:200,data,preview:true}));
}
module.exports={isEnabled:home.isEnabled,respond,modules};

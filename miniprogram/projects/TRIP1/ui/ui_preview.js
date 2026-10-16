// Development-tool fixtures. No database, uploads, or production API fallback.
const home = require('./home_preview.js');
const image = name => '/projects/TRIP1/images/' + name;
const text = val => ({type:'text',val});
const photo = val => ({type:'img',val});
const pictures = ['design/portal-mountains-v3.jpg','home/b3.jpg','design/ar-forest-v3.jpg','home/b1.jpg','home/b4.jpg','design/home-card-panorama-v1.jpg'].map(image);
const products = ['湖畔观景台','茶山漫步道','森林氧吧','山水文化长廊','溪谷休憩区','云端望景亭'].map((title,i)=>({
    _id:'ui-spot-'+i, PRODUCT_TITLE:title, PRODUCT_CATE_ID:String(i%3+1), PRODUCT_CATE_NAME:['山水风光','茶园风光','生态体验'][i%3], PRODUCT_DEMO:true, PRODUCT_VIEW_CNT:120+i*37,
    PRODUCT_OBJ:{cover:[pictures[i]],album:[pictures[i],pictures[(i+1)%6]],subtitle:'慢下来，发现山水间的美好',desc:title+'是园区里适合放慢脚步的一站。沿着步道欣赏层叠山色，听风穿过树林，在自然中享受片刻安静。\n\n这里适合散步、摄影和亲子自然观察。图文及路线信息均为本地 UI 演示。',address:'演示园区 · '+['湖畔区域','茶园区域','森林区域'][i%3],distance:(0.3+i*0.4).toFixed(1)+' km',duration:(20+i*10)+' 分钟',bestTime:'清晨 / 傍晚',time:'08:00—18:00',traffic:'从游客中心沿园区步道前往，沿途设有休憩点。',other:'建议穿舒适的步行鞋，自备饮水，爱护自然环境。示例路线不用于实际导航。'}
}));
const albums = ['山水精华半日游','亲子森林探索线','茶山人文慢行线','轻徒步一日游','美食寻味之旅','山间周末小住','园区伴手礼指南','雨天悠闲游'].map((title,i)=>{
    const spots=[products[i%6],products[(i+1)%6],products[(i+2)%6]];
    return {_id:'ui-route-'+i,ALBUM_TITLE:title,ALBUM_CATE_ID:i<4?'1':String(i-2),ALBUM_CATE_NAME:i<4?'经典路线':['吃喝','住宿','购物','其他'][i-4],ALBUM_DEMO:true,ALBUM_DURATION:i%2?'约 4 小时':'约 2 小时',ALBUM_VIEW_CNT:238+i*23,ALBUM_ADD_TIME:'2026-10-'+String(16-i).padStart(2,'0'),ALBUM_ORDER:i,
        ALBUM_OBJ:{cover:[pictures[i%6]],desc:'串联园区特色，轻松体验'+title+'。',spots:spots.map(s=>s._id),detail:[text('从游客中心出发，依次漫步山水、林间与人文空间。路线节奏舒缓，适合边走边看，安排半天到一天的休闲时光。'),photo(pictures[i%6]),text('出行贴士：备好饮水与舒适鞋履，根据天气调整行程。以上均为本地示例，不代表真实开放或服务信息。')]},ALBUM_SPOTS:spots.map((s,n)=>({...s,cover:s.PRODUCT_OBJ.cover[0],duration:'约 30 分钟',note:'第 '+(n+1)+' 站 · 沿步道游览',highlight:s.PRODUCT_TITLE}))};
});
const categories = {
    album:[['1','经典路线'],['2','吃喝'],['3','住宿'],['4','购物'],['5','其他']],
    product:[['1','山水风光'],['2','茶园风光'],['3','生态体验']],
    news:[['activity','活动资讯'],['announcement','园区公告'],['tips','游玩贴士'],['culture','人文故事'],['2','特色美食'],['3','地方特产']],
    merchant:[['food','美食'],['stay','住宿'],['travel','出行']]
};
const news = home.news.map((n,i)=>({...n,_id:n.id,NEWS_TITLE:n.title,NEWS_DESC:n.desc,NEWS_CATE_ID:i===3?'culture':n.cateId,NEWS_CATE_NAME:n.activityStart?'活动资讯':i===3?'人文故事':'游玩贴士',NEWS_PIC:[n.pic],NEWS_DEMO:true,NEWS_VIEW_CNT:n.views,NEWS_ADD_TIME:n.publishDate||'2026-10-16',NEWS_ACTIVITY_START:n.activityStart||'',NEWS_ACTIVITY_END:n.activityEnd||'',NEWS_CONTENT:[text(n.desc),photo(n.pic),text('在山水之间走走停停，感受自然的变化与旅途的美好。欢迎和家人朋友一起发现园区里的风景。\n\n本内容为本地 UI 预览示例，活动安排、时间和图片均不代表实际运营信息。')]}));
[['announcement','园区秋季游览温馨提示','出发前请关注天气，合理安排游览时间。'],['2','茶香山野风味餐','体验山野食材与地方特色风味。'],['3','把茶山的清香带回家','认识地方茶品与手作伴手礼。']].forEach(([category,title,desc],i)=>news.push({_id:'ui-news-extra-'+i,NEWS_TITLE:title,NEWS_DESC:desc,NEWS_CATE_ID:category,NEWS_CATE_NAME:categories.news.find(c=>c[0]===category)[1],NEWS_PIC:[pictures[(i+1)%6]],NEWS_DEMO:true,NEWS_VIEW_CNT:88,NEWS_ADD_TIME:'2026-10-16',NEWS_CONTENT:[text(desc),photo(pictures[(i+1)%6]),text('本地界面演示内容，不代表真实商品、服务或开放安排。')]}));
const merchants = [];
const merchantNames={food:['茶山小馆','湖畔轻食','山野茶歇'],stay:['山间小院','湖畔民宿','森林营地'],travel:['游客中心停车场','园区接驳站','慢行租赁服务']};
Object.keys(merchantNames).forEach(category=>merchantNames[category].forEach((name,i)=>merchants.push({_id:'ui-merchant-'+category+'-'+i,MERCHANT_NAME:name,MERCHANT_CATEGORY:category,MERCHANT_DESC:{food:'游览途中歇歇脚，感受自然与地方风味。',stay:'在山水间小住，享受悠闲假日。',travel:'为园区游览提供便利的出行配套。'}[category],MERCHANT_IMAGES:[pictures[(i+(category==='stay'?2:0))%6]],MERCHANT_ADDRESS:'演示园区 · 游客服务区',MERCHANT_PHONE:'',MERCHANT_HOURS:'09:00—18:00（示例）',MERCHANT_DEMO:true,MERCHANT_CONTENT:[text('本条为本地界面演示服务，图片使用现有园区素材，不代表真实商家。不提供实际预订、联系或交易。')]})));
const scenic={_id:'ui-scenic',SCENIC_NAME:'山水自然园区',SCENIC_DESC:'在山水之间漫步，在自然之中遇见美好。',SCENIC_IMAGES:pictures.slice(0,4),SCENIC_DEMO:true,SCENIC_HOURS:'08:00—18:00（示例）',SCENIC_ADDRESS:'本地演示园区 · 山水路游客中心',SCENIC_CONTENT:[text('这里有开阔的山水风光、清幽的森林步道和层层叠叠的茶园。沿着游步道慢行，在湖边停留，在林间呼吸，感受每一段旅程的松弛与自在。'),photo(pictures[1]),text('园区融合自然体验与人文探索，适合亲子漫游、摄影采风和周末休闲。所有内容仅供 UI 预览。')],SCENIC_INFO:{tagline:'自然为伴 · 美好出发',rating:'生态休闲',altitude:'约 800 m',history:'山水人文',visitDuration:'建议安排半天至一天',highlights:[{title:'山水画境',desc:'湖光与山色相映，在观景台收藏一段好风光。',imageIndex:1},{title:'茶山慢生活',desc:'走进茶田小径，在清风中享受悠闲时光。',imageIndex:2},{title:'森林自然课堂',desc:'观察植物与四季变化，和孩子一起探索自然。',imageIndex:3}],selfDrive:'导航至园区游客中心后步行入园（演示说明）。',transit:'在游客服务中心了解公共交通与接驳安排。',parking:'游客中心设停车服务区，具体以现场公示为准。',tips:'文明游览，爱护环境；以上信息均为本地演示，请勿用于实际出行。'}};
const modules={product:products,album:albums,news,merchant:merchants,scenic:[scenic]};
const setup={BUS:'公共交通\n可在游客中心了解公交及接驳路线。发车时间以现场信息为准。',PARKING:'停车服务\n游客中心设有停车区，请按现场指引停放，勿占用消防通道。',TOLIET:'公共卫生间\n游客中心、湖畔休憩区及茶山入口设有公共卫生间。',LXS:'旅行服务\n团队游览可前往游客服务中心咨询行程与配套服务。',DY:'导游服务\n可在游客中心咨询园区讲解与自然体验服务。',WEATHER:'天气示例\n周五 晴 18—26℃\n周六 多云 17—25℃\n周日 晴 18—27℃\n\n此处仅演示排版，不是实时天气。'};
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

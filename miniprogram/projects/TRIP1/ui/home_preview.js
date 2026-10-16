// Visual fixtures only: never persisted or returned by business APIs.
const IMAGE = '/projects/TRIP1/images/';
function isEnabled(wxApi, settings) {
    if (!settings.HOME_UI_PREVIEW) return false;
    try {
        const account = wxApi.getAccountInfoSync();
        const device = wxApi.getDeviceInfo ? wxApi.getDeviceInfo() : wxApi.getSystemInfoSync();
        return account.miniProgram.envVersion === 'develop' && device.platform === 'devtools';
    } catch (_) { return false; }
}
const portal = {
    brandName: '江纺1953', scenic: null, featured: [],
    slides: [
        {image: IMAGE + 'town/street-v1.jpg', title: '江纺1953', subtitle: '江纺1953 · 拾光小镇，遇见日常好时光'},
        {image: IMAGE + 'town/courtyard-v1.jpg', title: '江纺1953', subtitle: '逛街区、品美食，慢享小镇生活'},
        {image: IMAGE + 'town/night-v1.jpg', title: '江纺1953', subtitle: '在小镇走走停停，收藏属于你的时光'},
    ],
};
const news = [
    {id:'ui-preview-autumn', title:'小镇秋日漫游', desc:'沿着小镇街区走走，寻找适合周末停留的去处。', pic:IMAGE+'town/night-v1.jpg', activityStart:'2026-10-01', activityEnd:'2026-11-15', views:128},
    {id:'ui-preview-camp', title:'周末小镇相聚', desc:'约上家人朋友，在小镇度过轻松的周末时光。', pic:IMAGE+'town/street-v1.jpg', activityStart:'2026-10-17', activityEnd:'2026-10-25', views:96},
    {id:'ui-preview-tea', title:'小镇慢生活体验', desc:'逛逛街边小店，给自己留一段休闲时光。', pic:IMAGE+'town/courtyard-v1.jpg', activityStart:'2026-10-10', activityEnd:'2026-11-08', views:86},
    {id:'ui-preview-culture', title:'江纺街区漫游', desc:'走进小镇街区，在日常生活中发现江纺故事。', pic:IMAGE+'town/street-v1.jpg', publishDate:'2026-10-14', views:152},
    {id:'ui-preview-photo', title:'定格小镇好时光', desc:'带上相机，记录街区角落和相聚时刻。', pic:IMAGE+'town/courtyard-v1.jpg', activityStart:'2026-10-16', activityEnd:'2026-11-30', views:73},
    {id:'ui-preview-guide', title:'周末逛镇指南', desc:'挑选适合自己的逛镇路线，安排吃喝逛玩的悠闲一天。', pic:IMAGE+'town/night-v1.jpg', publishDate:'2026-10-15', views:204},
].map(item=>({...item,type:'news',cateId:item.activityStart?'activity':item.id==='ui-preview-culture'?'culture':'tips',demo:true,preview:true}));
module.exports = {isEnabled, portal, news};

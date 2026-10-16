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
    brandName: 'WeTravel', scenic: null, featured: [],
    slides: [
        {image: IMAGE + 'design/portal-mountains-v3.jpg', title: '山水相逢\n不负好时光', subtitle: '走进山水，遇见更好的自己'},
        {image: IMAGE + 'home/b3.jpg', title: '漫步茶山\n把时光留给自然', subtitle: '寻一缕茶香，感受山野的温柔'},
        {image: IMAGE + 'design/ar-forest-v3.jpg', title: '林间有清风\n一路皆风景', subtitle: '沿着绿荫小径，发现身边的美好'},
    ],
};
const news = [
    {id:'ui-preview-autumn', title:'秋日自然探索活动', desc:'沿着林间步道，发现秋日里的自然之美。', pic:IMAGE+'design/ar-forest-v3.jpg', activityStart:'2026-10-01', activityEnd:'2026-11-15', views:128},
    {id:'ui-preview-camp', title:'山野露营计划', desc:'暂别城市喧嚣，在山水之间度过悠闲周末。', pic:IMAGE+'design/portal-mountains-v3.jpg', activityStart:'2026-10-17', activityEnd:'2026-10-25', views:96},
    {id:'ui-preview-tea', title:'茶山慢行体验', desc:'走进层层茶田，寻找一杯茶背后的山野故事。', pic:IMAGE+'home/b3.jpg', activityStart:'2026-10-10', activityEnd:'2026-11-08', views:86},
    {id:'ui-preview-culture', title:'山水人文之旅', desc:'探访传统建筑，感受自然与人文交融的魅力。', pic:IMAGE+'home/b1.jpg', publishDate:'2026-10-14', views:152},
    {id:'ui-preview-photo', title:'定格园区好风光', desc:'带上相机，记录晨雾、山色与旅途中的小惊喜。', pic:IMAGE+'design/home-card-panorama-v1.jpg', activityStart:'2026-10-16', activityEnd:'2026-11-30', views:73},
    {id:'ui-preview-guide', title:'周末轻徒步指南', desc:'挑选适合自己的游览路线，轻松开启一段山野旅行。', pic:IMAGE+'home/b4.jpg', publishDate:'2026-10-15', views:204},
].map(item=>({...item,type:'news',cateId:item.activityStart?'activity':item.id==='ui-preview-culture'?'culture':'tips',demo:true,preview:true}));
module.exports = {isEnabled, portal, news};

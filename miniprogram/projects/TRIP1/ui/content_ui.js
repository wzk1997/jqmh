const PAGE_ROOT = '/projects/TRIP1/pages/';
function cleanImage(image) {
    image = Array.isArray(image) ? image[0] : image;
    return typeof image === 'string' && image !== '/images/cover.gif' ? image : '';
}
function displayDate(value) {
    if (typeof value === 'string' && /^\d{4}[-.]\d{2}[-.]\d{2}/.test(value)) return value.slice(0, 10).replace(/-/g, '.');
    if (typeof value === 'number' && value > 100000000000) {
        const date = new Date(value);
        return date.getFullYear() + '.' + String(date.getMonth() + 1).padStart(2, '0') + '.' + String(date.getDate()).padStart(2, '0');
    }
    return '';
}
function classifyNews(item) {
    const text = (item.title || '') + ' ' + (item.desc || '');
    if (/公告|通知|开放时间|闭园|调整/.test(text)) return 'announcement';
    if (/活动|比赛|摄影赛|节庆|展览|招募/.test(text)) return 'activity';
    if (/人文|历史|古建|文化|故事/.test(text)) return 'culture';
    if (/攻略|路线|推荐|贴士|指南/.test(text)) return 'tips';
    return 'news';
}
function normalizeContent(item, forcedType) {
    const type = forcedType || item.type || (item.SPOT_TITLE ? 'spot' : item.GUIDE_TITLE ? 'guide' : 'news');
    const prefix = type === 'spot' ? 'SPOT' : type === 'guide' ? 'GUIDE' : 'NEWS';
    const object = item[prefix + '_OBJ'] || {};
    const id = item.id || item._id;
    const title = item.title || item[prefix + '_TITLE'] || '';
    const desc = item.desc || item[prefix + '_DESC'] || object.desc || '';
    const categoryId=item.cateId||item[prefix+'_CATE_ID']||'';
    const kind = type==='news'&&['activity','announcement','tips'].includes(categoryId)?categoryId:classifyNews({ title, desc });
    const labels = { announcement: '公告', activity: '活动', culture: '人文', tips: '推荐', news: '资讯' };
    return {
        ...item, id, type, key: type + ':' + id, title, desc,
        pic: cleanImage(item.pic || item.NEWS_PIC || object.cover),
        date: displayDate(item.publishDate) || displayDate(item[prefix + '_PUBLISH_TIME']) || displayDate(item.date) || displayDate(item[prefix + '_ADD_TIME']) || displayDate(item.ext),
        activityDate: (item.activityStart || item.NEWS_ACTIVITY_START) && (item.activityEnd || item.NEWS_ACTIVITY_END) ? displayDate(item.activityStart || item.NEWS_ACTIVITY_START) + ' — ' + displayDate(item.activityEnd || item.NEWS_ACTIVITY_END) : '',
        label: type === 'news' ? (['activity','announcement','tips','1','2','3',''].includes(categoryId)?labels[kind]:item.cateName||item.NEWS_CATE_NAME||labels[kind]) : (item[prefix + '_CATE_NAME'] || (type === 'guide' ? '攻略' : '景点')),
        kind, categoryId, demo:!!(item.demo||item[prefix+'_DEMO']), views: item[prefix + '_VIEW_CNT'] || item.views || 0,
        path: PAGE_ROOT + type + '/detail/' + type + '_detail?id=' + encodeURIComponent(id),
    };
}
function filterNews(items, facet) {
    if (!facet || facet === 'all') return items;
    if (facet === 'tips') return items.filter(item => item.categoryId==='tips'||(!item.categoryId&&['tips','news'].includes(item.kind)));
    if(!['activity','announcement','culture','news'].includes(facet))return items.filter(item=>item.categoryId===facet);
    return items.filter(item => item.kind === facet);
}
function mergeContent(...lists) {
    const seen = {};
    return [].concat(...lists).filter(item => item && item.id && !seen[item.key] && (seen[item.key] = true));
}
module.exports = { cleanImage, displayDate, classifyNews, normalizeContent, filterNews, mergeContent };

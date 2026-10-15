// Display-only URLs for canonical published content. Never accepts client file IDs.
const cloudBase = require('../../../framework/cloud/cloud_base.js');
const config = require('../../../config/config.js');
const TYPES = ['news', 'guide', 'spot', 'scenic', 'merchant', 'panorama'];
const ROUTES = new Set(['home/list', 'home/portal', 'news/list', 'news/view', 'guide/list', 'guide/view', 'spot/list', 'spot/view', 'cms/list', 'cms/detail']);
function collect(route, data, params = {}, environment = config.CLOUD_ID || process.env.TCB_ENV || process.env.SCF_NAMESPACE, allowDrafts = false) {
    if (!ROUTES.has(route)) return [];
    const files = new Set();
    function record(row, type, id) {
        if (!row || !TYPES.includes(type) || typeof id !== 'string' || !/^[\w-]{1,100}$/.test(id)) return;
        const oldType = {spot:'product', guide:'album'}[type];
        const folders = ['TRIP1/' + type + '/' + id + '/'];
        if (oldType) folders.push('TRIP1/' + oldType + '/' + id + '/');
        function visit(value, depth = 0) {
            if (depth > 12 || files.size >= 1000) return;
            if (typeof value === 'string') {
                const match = /^cloud:\/\/([^/]+)\/(.+)$/.exec(value);
                if (match && match[1].split('.')[0] === environment && folders.some(folder => match[2].startsWith(folder))
                    && !/[\\?#]|(?:^|\/)\.\.(?:\/|$)/.test(match[2]) && /\.(?:png|jpe?g|webp)$/i.test(match[2])) files.add(value);
            } else if (Array.isArray(value)) value.forEach(item => visit(item, depth + 1));
            else if (value && typeof value === 'object') Object.keys(value).forEach(key => {
                if ((allowDrafts || !key.endsWith('_DRAFT')) && key !== 'GUIDE_SPOTS' && key !== 'relatedSpots') visit(value[key], depth + 1);
            });
        }
        visit(row);
        if (type === 'guide') (row.GUIDE_SPOTS || []).forEach(spot => record(spot, 'spot', spot._id));
        if (allowDrafts && type === 'guide') (row.relatedSpots || []).forEach(spot => record(spot, 'spot', spot.id));
    }
    if (route === 'home/portal') {
        record(data && data.scenic, 'scenic', data && data.scenic && data.scenic._id);
        if (data && data.scenic) record(data.slides, 'scenic', data.scenic._id);
        (data && data.featured || []).forEach(row => {
            const type = row.type || TYPES.find(t => row[t.toUpperCase() + '_NAME']);
            record(row, type, row._id || row.id);
        });
    } else if (route === 'home/list') (data || []).forEach(row => record(row, row.type, row.id));
    else {
        const type = route.startsWith('cms/') ? params.module : route.split('/')[0];
        (data && Array.isArray(data.list) ? data.list : [data]).forEach(row => record(row, type, row && (row._id || row.id)));
    }
    return [...files];
}
// Called only after the corresponding controller's identity and module permission gate.
function collectAdmin(route, data, params = {}, environment = config.CLOUD_ID || process.env.TCB_ENV || process.env.SCF_NAMESPACE) {
    if (['admin/cms_detail', 'admin/cms_list', 'admin/portal_choices'].includes(route))
        return collect('cms/detail', data, params, environment, true);
    if (route === 'admin/cms_spots')
        return collect('spot/list', {list:[...(data.list || []), ...(data.selected || [])]}, {}, environment);
    if (['admin/cms_upload', 'admin/portal_upload'].includes(route)) {
        const module = route === 'admin/portal_upload' ? 'scenic' : params.module;
        return collect('cms/detail', {_id:params.id || params.scenicId, image:data.fileID}, {module}, environment);
    }
    if (route === 'admin/portal_get') {
        return [...new Set([data.draft, data.published].filter(Boolean).flatMap(config =>
            collect('cms/detail', {_id:config.scenicId, slides:config.slides}, {module:'scenic'}, environment)))];
    }
    return [];
}
async function sign(files, maxAge) {
    const mediaUrls = {};
    if (!files.length) return mediaUrls;
    const cloud = cloudBase.getCloud();
    for (let offset = 0; offset < files.length; offset += 50) {
        try {
            const result = await cloud.getTempFileURL({fileList: files.slice(offset, offset + 50).map(fileID => ({fileID, maxAge}))});
            for (const item of result.fileList || []) {
                if (files.includes(item.fileID) && (!item.status || item.status === 0) && /^https:\/\//.test(item.tempFileURL || '')) mediaUrls[item.fileID] = item.tempFileURL;
            }
        } catch (_) { console.warn('Content media URL batch unavailable'); }
    }
    return mediaUrls;
}
async function urls(route, data, params) { return sign(collect(route, data, params), 3600); }
async function adminUrls(route, data, params) { return sign(collectAdmin(route, data, params), 900); }
module.exports = {collect, collectAdmin, urls, adminUrls};

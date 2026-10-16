// Display-only URLs for canonical published content. Never accepts client file IDs.
const cloudBase = require('../../../framework/cloud/cloud_base.js');
const config = require('../../../config/config.js');
const TYPES = ['news', 'album', 'product', 'scenic', 'merchant'];
const ROUTES = new Set(['home/portal', 'news/list', 'news/view', 'album/list', 'album/view', 'product/list', 'product/view', 'cms/list', 'cms/detail']);
// Canonical carousel images have their own namespace; retain already-published scenic images.
function portalFiles(slides,environment){
 return [...new Set((slides||[]).map(s=>s.image).filter(id=>{
  const m=typeof id==='string'&&/^cloud:\/\/([^/]+)\/(.+)$/.exec(id);
  return m&&m[1].split('.')[0]===environment&&/^TRIP1\/(home_portal\/SETUP_HOME_PORTAL|scenic\/[\w-]+)\//.test(m[2])&&!/[\\?#]|(?:^|\/)\.\.(?:\/|$)/.test(m[2])&&/\.(?:png|jpe?g|webp)$/i.test(m[2]);
 }))];
}
function collect(route, data, params = {}, environment = config.CLOUD_ID, allowDrafts = false) {
    if (!ROUTES.has(route)) return [];
    const files = new Set();
    function record(row, type, id) {
        if (!row || !TYPES.includes(type) || typeof id !== 'string' || !/^[\w-]{1,100}$/.test(id)) return;
        const folder = 'TRIP1/' + type + '/' + id + '/';
        function visit(value, depth = 0) {
            if (depth > 12 || files.size >= 1000) return;
            if (typeof value === 'string') {
                const match = /^cloud:\/\/([^/]+)\/(.+)$/.exec(value);
                if (match && match[1].split('.')[0] === environment && match[2].startsWith(folder)
                    && !/[\\?#]|(?:^|\/)\.\.(?:\/|$)/.test(match[2]) && /\.(?:png|jpe?g|webp)$/i.test(match[2])) files.add(value);
            } else if (Array.isArray(value)) value.forEach(item => visit(item, depth + 1));
            else if (value && typeof value === 'object') Object.keys(value).forEach(key => {
                if ((allowDrafts || !key.endsWith('_DRAFT')) && key !== 'ALBUM_SPOTS' && key !== 'relatedSpots') visit(value[key], depth + 1);
            });
        }
        visit(row);
        if (type === 'album') (row.ALBUM_SPOTS || []).forEach(spot => record(spot, 'product', spot._id));
        if (allowDrafts && type === 'album') (row.relatedSpots || []).forEach(spot => record(spot, 'product', spot.id));
    }
    if (route === 'home/portal') {
        portalFiles(data&&data.slides,environment).forEach(id=>files.add(id));
    }
    else {
        const type = route.startsWith('cms/') ? params.module : route.split('/')[0];
        (data && Array.isArray(data.list) ? data.list : [data]).forEach(row => record(row, type, row && (row._id || row.id)));
    }
    return [...files];
}
// Called only after the corresponding controller's identity and module permission gate.
function collectAdmin(route, data, params = {}, environment = config.CLOUD_ID) {
    if (['admin/cms_detail', 'admin/cms_list', 'admin/portal_choices'].includes(route))
        return collect('cms/detail', data, params, environment, true);
    if (route === 'admin/cms_spots')
        return collect('product/list', {list:[...(data.list || []), ...(data.selected || [])]}, {}, environment);
    if (['admin/cms_upload', 'admin/portal_upload'].includes(route)) {
        if(route==='admin/portal_upload')return portalFiles([{image:data.fileID}],environment);
        const module = params.module;
        return collect('cms/detail', {_id:params.id || params.scenicId, image:data.fileID}, {module}, environment);
    }
    if (route === 'admin/portal_get')return portalFiles([data.draft,data.published].filter(Boolean).flatMap(c=>c.slides||[]),environment);
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

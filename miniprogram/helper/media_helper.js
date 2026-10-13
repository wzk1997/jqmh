// Keep original cloud IDs in records; cache only authorized display URLs in memory.
let entries = {};
function snapshot() {
    const mediaUrls = {}, now = Date.now();
    for (const id of Object.keys(entries)) {
        if (entries[id].expires <= now) delete entries[id];
        else mediaUrls[id] = entries[id].url;
    }
    return mediaUrls;
}
function remember(urls) {
    const now = Date.now();
    for (const id of Object.keys(entries)) if (entries[id].expires <= now) delete entries[id];
    for (const id of Object.keys(urls || {})) {
        if (id.startsWith('cloud://') && /^https:\/\//.test(urls[id])) entries[id] = {url: urls[id], expires: now + 3300000};
    }
    const ids = Object.keys(entries);
    if (ids.length > 1000) for (const id of ids.slice(0, ids.length - 1000)) delete entries[id];
    const mediaUrls = snapshot();
    if (typeof getCurrentPages === 'function') getCurrentPages().forEach(page => page.setData({mediaUrls}));
    return mediaUrls;
}
function rememberAdmin(urls) {
    // Do not put draft URLs in the shared cache or ordinary visitor pages.
    if (typeof getCurrentPages !== 'function') return;
    getCurrentPages().filter(page => (page.route || '').includes('/pages/admin/') || page.data.adminPreview).forEach(page => {
        const mediaUrls = {...page.data.mediaUrls};
        for (const id of Object.keys(urls || {})) if (id.startsWith('cloud://') && /^https:\/\//.test(urls[id])) mediaUrls[id] = urls[id];
        page.setData({mediaUrls});
    });
}
function display(id, pageUrls) {
    if (pageUrls && pageUrls[id]) return pageUrls[id];
    const entry = entries[id];
    return entry && entry.expires > Date.now() ? entry.url : id;
}
module.exports = {remember, rememberAdmin, display, snapshot};

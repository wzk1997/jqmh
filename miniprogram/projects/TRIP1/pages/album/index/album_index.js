const cloudHelper = require('../../../../../helper/cloud_helper.js');
const ProjectBiz = require('../../../biz/project_biz.js');
const pageHelper = require('../../../../../helper/page_helper.js');
const { normalizeContent } = require('../../../ui/content_ui.js');

Page({
    data: {
        items: [], loading: false, error: false, page: 0, hasMore: false,
        category: '1', contentMode: 'route', sort: 'recommend',
        sorts: [{ id: 'recommend', name: '推荐攻略' }, { id: 'new', name: '最新发布' }, { id: 'popular', name: '最受欢迎' }],
        entries: [{ id: 'route', name: '经典路线', icon: 'icon-album', color: 'green' }, { id: 'spots', name: '必玩景点', icon: 'icon-location', color: 'orange' }, { id: 'tips', name: '游玩贴士', icon: 'icon-roundcheckfill', color: 'blue' }]
    },
    bindScenicLayout(e) { this.setData({ uiChrome: e.detail }); },
    onLoad(options = {}) { ProjectBiz.initPage(this); this.setData({ category: options.id || '1' }); this.load(); },
    onShow() { ProjectBiz.syncTabBar(this, 2); },
    async load(more = false) {
        more = more === true;
        if (more && this.data.loading) return;
        const serial = this.serial = (this.serial || 0) + 1;
        const page = more ? this.data.page + 1 : 1;
        const contentMode = this.data.contentMode;
        let route;
        let params;
        if (contentMode === 'tips') {
            route = 'news/list';
            params = { page, size: 20, cateId: 'tips' };
        } else if (contentMode === 'spots') {
            route = 'product/list';
            params = { page, size: 20 };
        } else {
            const orderBy = this.data.sort === 'new' ? { ALBUM_ADD_TIME: 'desc' } : this.data.sort === 'popular' ? { ALBUM_VIEW_CNT: 'desc', ALBUM_ADD_TIME: 'desc' } : { ALBUM_ORDER: 'asc', ALBUM_ADD_TIME: 'desc' };
            route = 'album/list';
            params = { page, size: 20, sortType: 'cateId', sortVal: this.data.category, orderBy, ...(this.data.sort === 'new' ? { sortMode: 'latest' } : {}) };
        }
        this.setData({ loading: true, error: false, ...(more ? {} : { items: [], hasMore: false }) });
        try {
            const result = await cloudHelper.callCloudSumbit(route, params, { title: 'bar' });
            if (serial !== this.serial) return;
            const data = result.data || {};
            const rows = (data.list || []).map(row => {
                if (contentMode === 'tips') return normalizeContent(row, 'news');
                if (contentMode === 'spots') {
                    const object = row.PRODUCT_OBJ || {};
                    return { ...normalizeContent(row, 'product'), distance: object.distance || '', duration: object.duration || object.time || '' };
                }
                return { ...normalizeContent(row, 'album'), duration: row.ALBUM_DURATION || '', spotCount: (row.ALBUM_OBJ && row.ALBUM_OBJ.spots || []).length };
            });
            this.setData({ items: page === 1 ? rows : this.data.items.concat(rows), page, hasMore: page * 20 < (data.total || 0) });
        } catch (_) {
            if (serial === this.serial) this.setData({ error: true });
        } finally {
            if (serial === this.serial) this.setData({ loading: false });
        }
    },
    clearCategory() { this.setData({ category: '1', contentMode: 'route' }); this.load(); },
    sort(e) { if (this.data.contentMode !== 'route') return; this.setData({ sort: e.currentTarget.dataset.id }); this.load(); },
    entry(e) {
        const id = e.currentTarget.dataset.id;
        if (!['route', 'spots', 'tips'].includes(id)) return;
        if (id !== 'route' && this.data.contentMode === id) return;
        if (id === 'route' && this.data.contentMode === 'route' && this.data.category === '1') return;
        this.setData({ contentMode: id, ...(id === 'route' ? { category: '1' } : {}) });
        this.load();
    },
    detail(e) { const path = e.currentTarget.dataset.path; if (path) wx.navigateTo({ url: path }); },
    onReachBottom() { if (this.data.hasMore && !this.data.error) this.load(true); },
    onPullDownRefresh() { this.load().finally(() => wx.stopPullDownRefresh()); },
    url(e) { pageHelper.url(e, this); }
});

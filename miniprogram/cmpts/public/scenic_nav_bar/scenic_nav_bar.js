const { getChrome } = require('../../../projects/TRIP1/ui/navigation_ui.js');
const HOME = '/projects/TRIP1/pages/default/index/default_index';
Component({
    options: { addGlobalClass: true, multipleSlots: true },
    properties: {
        mode: { type: String, value: 'page' },
        title: { type: String, value: '' },
        subtitle: { type: String, value: '' },
        brand: { type: Boolean, value: false },
        back: { type: Boolean, value: true },
        search: { type: Boolean, value: false },
        searchUrl: { type: String, value: '' },
        actions: { type: Array, value: [] },
        rightSlotWidth: { type: Number, value: 0 },
        overlay: { type: Boolean, value: false },
        fixed: { type: Boolean, value: true },
    },
    data: { chrome: { status: 20, height: 64, rowTop: 20, right: 104 }, titleInset: 104, titleLeft: 104, titleRight: 104 },
    observers: { 'search, actions, back, rightSlotWidth': function () { this.updateLayout(); } },
    lifetimes: { created(){this._navReady=false;}, attached() { this.updateLayout(); }, ready(){this._navReady=true;this.updateLayout();} },
    pageLifetimes: { resize() { this.updateLayout(); } },
    methods: {
        updateLayout() {
            const chrome = getChrome();
            const actionsWidth = (this.data.actions || []).length * 44;
            const titleInset = Math.max(this.data.back ? 60 : 12, chrome.right + actionsWidth + (this.data.search ? 44 : 0) + Math.max(0, this.data.rightSlotWidth));
            const titleLeft = (chrome.width || 375) - titleInset * 2 >= 48 ? titleInset : (this.data.back ? 60 : 12);
            this.setData({ chrome, titleInset, titleLeft, titleRight: titleInset });
            if(this._navReady!==false)this.triggerEvent('layout', { ...chrome });
        },
        goHome() {
            wx.switchTab({ url: HOME, fail: () => wx.reLaunch({ url: HOME }) });
        },
        goBack() {
            if (this.returning) return;
            if (getCurrentPages().length <= 1) { this.goHome(); return; }
            this.returning = true;
            wx.navigateBack({
                delta: 1,
                fail: () => this.goHome(),
                complete: () => { this.returning = false; }
            });
        },
        searchTap() {
            this.triggerEvent('search');
            if (this.data.searchUrl) wx.navigateTo({ url: this.data.searchUrl });
        },
        actionTap(e) {
            const action = (this.data.actions || [])[Number(e.currentTarget.dataset.index)];
            if (action) this.triggerEvent('action', { id: action.id });
        }
    }
});

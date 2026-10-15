const tabs = [
    {
        "path": "/projects/TRIP1/pages/default/index/default_index",
        "text": "首页",
        "icon": "/projects/TRIP1/images/ui/home_v2.png",
        "activeIcon": "/projects/TRIP1/images/ui/home_v2_active.png"
    },
    {
        "path": "/projects/TRIP1/pages/spot/index/spot_index",
        "text": "景区导览",
        "icon": "/projects/TRIP1/images/ui/guide_v2.png",
        "activeIcon": "/projects/TRIP1/images/ui/guide_v2_active.png"
    },
    {
        "path": "/projects/TRIP1/pages/guide/index/guide_index",
        "text": "园区攻略",
        "icon": "/projects/TRIP1/images/ui/guide_v2.png",
        "activeIcon": "/projects/TRIP1/images/ui/guide_v2_active.png"
    },
    {
        "path": "/projects/TRIP1/pages/my/index/my_index",
        "text": "我的",
        "icon": "/projects/TRIP1/images/ui/profile_v2.png",
        "activeIcon": "/projects/TRIP1/images/ui/profile_v2_active.png"
    }
];
Component({
    data: { selected: 0, tabs },
    lifetimes: { attached() { this.syncSelection(); } },
    pageLifetimes: { show() { this.syncSelection(); } },
    methods: {
        syncSelection() {
            const pages = getCurrentPages();
            const page = pages[pages.length - 1];
            const selected = page ? tabs.findIndex(tab => tab.path === '/' + page.route) : -1;
            if (selected >= 0) this.setData({ selected });
        },
        switchTab(e) {
            const index = Number(e.currentTarget.dataset.index);
            if (!Number.isInteger(index) || !tabs[index] || index === this.data.selected || this.switching) return;
            this.switching = true;
            wx.switchTab({
                url: tabs[index].path,
                success: () => this.setData({ selected: index }),
                fail: () => wx.showToast({ title: '页面暂时无法打开，请重试', icon: 'none' }),
                complete: () => { this.switching = false; }
            });
        }
    }
});

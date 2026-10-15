const setting = require('./setting/setting.js');

App({
	onLaunch: function (options) {

		if (!setting.CLOUD_ID) {
			console.warn('本地模式：未初始化微信云环境，数据使用本地 SQLite')
		} else if (!wx.cloud) {
			console.error('请使用 2.2.3 或以上的基础库以使用云能力')
		} else {
			wx.cloud.init({
				// env 参数说明：
				//   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
				//   此处请填入环境 ID, 环境 ID 可打开云控制台查看
				env: setting.CLOUD_ID,
				traceUser: true,
			})
		}

		this.globalData = {};

		// 用于自定义导航栏
		wx.getSystemInfo({
			success: e => {
				this.globalData.statusBar = e.statusBarHeight;
				let capsule = wx.getMenuButtonBoundingClientRect();
				if (capsule) {
					this.globalData.custom = capsule;
					this.globalData.customBar = capsule.bottom + capsule.top - e.statusBarHeight;
				} else {
					this.globalData.customBar = e.statusBarHeight + 50;
				} 
			}
		});
	}, 
	 
})

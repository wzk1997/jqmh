module.exports = {
	//### 环境相关 
	CLOUD_ID: '', // 本地开发保持为空，禁止连接线上云环境
	LOCAL_API_BASE: 'http://127.0.0.1:8787', // SQLite 本地后端

	// #### 版本信息 
	VER: 'build 2022.08.14',
	COMPANY: '联系作者',

	// #### 系统参数 
	IS_SUB: false, //分包模式 
	IS_DEMO: false, //是否演示版  

	MOBILE_CHECK: false, //手机号码是否真实性校验


	//#################     
	IMG_UPLOAD_SIZE: 20, //图片上传大小M兆    

	// #### 缓存相关
	CACHE_IS_LIST: true, //列表是否缓存
	CACHE_LIST_TIME: 60 * 30, //列表缓存时间秒    

}

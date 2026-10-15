/**
 * Notes: 云初始化实例
 * Ver : CCMiniCloud Framework 2.2.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2020-09-05 04:00:00 
 */

const config = require('../../config/config.js');

/**
 * 获得云实例
 */
function getCloud() {
	if (!config.CLOUD_ID) {
		throw new Error('CLOUD_ID 未配置：本地开发禁止自动连接默认云环境');
	}
	const cloud = require('wx-server-sdk');
	cloud.init({
		env: config.CLOUD_ID
	});
	return cloud;
}

module.exports = {
	getCloud
}

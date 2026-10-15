/**
 * Notes: 预约模块业务逻辑
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2021-12-10 07:48:00
 */

const BaseBiz = require('../../../comm/biz/base_biz.js');
const pageHelper = require('../../../helper/page_helper.js');
const dataHelper = require('../../../helper/data_helper.js');
const projectSetting = require('../public/project_setting.js');

class ReservationBiz extends BaseBiz {

	static async subscribeMessageReservation(callback) {
		callback && await callback();
	}

	static setTypeTitle(that, typeId = null) {

		let typeList =   projectSetting.RESERVATION_TYPE ;
		for (let k = 0; k < typeList.length; k++) {
			if (typeList[k].id == typeId) {
				wx.setNavigationBarTitle({
					title: typeList[k].title
				});

				if (typeList[k].style) { //样式
					that.setData({
						listMode: typeList[k].style
					});
				} else {
					that.setData({
						listMode: 'leftpic'
					});
				}
			}
		}
		return '';

	}

}

module.exports = ReservationBiz;

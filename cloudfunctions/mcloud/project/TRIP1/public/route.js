/**
 * Notes: 路由配置文件
  * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * User: CC
 * Date: 2020-10-14 07:00:00
 */

module.exports = {
    "home/portal": "home_controller@portal",
    "admin/portal_get": "admin/admin_portal_controller@get",
    "admin/portal_save": "admin/admin_portal_controller@save",
    "admin/portal_publish": "admin/admin_portal_controller@publish",
    "admin/portal_upload": "admin/admin_portal_controller@upload",
    "admin/portal_choices": "admin/admin_portal_controller@choices",
    'admin/cms_list': 'admin/admin_cms_controller@list',
    'admin/cms_detail': 'admin/admin_cms_controller@detail',
    'admin/cms_save': 'admin/admin_cms_controller@save',
    'admin/cms_state': 'admin/admin_cms_controller@state',
    'admin/cms_remove': 'admin/admin_cms_controller@remove',
    'admin/cms_upload': 'admin/admin_cms_controller@upload',
    'admin/cms_demo_reserve': 'admin/admin_cms_controller@reserveDemo',
    'admin/cms_spots': 'admin/admin_cms_controller@spots',
    'admin/cms_categories': 'admin/admin_cms_controller@categories',
    'cms/list': 'cms_controller@list',
    'cms/detail': 'cms_controller@detail',
    'cms/categories': 'cms_controller@categories',

	'test/test': 'test/test_controller@test',

	'home/setup_get': 'home_controller@getSetup',

	'passport/login': 'passport_controller@login',
	'passport/phone': 'passport_controller@getPhone',
	'passport/my_detail': 'passport_controller@getMyDetail',
	'passport/register': 'passport_controller@register',
	'passport/edit_base': 'passport_controller@editBase',

	'admin/feedback_detail':'admin/admin_feedback_controller@detail',
    'admin/feedback_search':'admin/admin_feedback_controller@search',
    'admin/feedback_process':'admin/admin_feedback_controller@process',
	// 客户反馈
	'feedback/upload':'feedback_controller@upload',
	'feedback/submit': 'feedback_controller@submit',
	'feedback/my_list': 'feedback_controller@myList',
	'admin/feedback_list': 'admin/admin_feedback_controller@list',
	'admin/feedback_reply': 'admin/admin_feedback_controller@reply#demo',

	// 收藏
	'fav/update': 'fav_controller@updateFav',
	'fav/del': 'fav_controller@delFav',
	'fav/is_fav': 'fav_controller@isFav',
	'fav/my_list': 'fav_controller@getMyFavList',

	'admin/home': 'admin/admin_home_controller@adminHome',
	'admin/clear_vouch': 'admin/admin_home_controller@clearVouchData',

	'admin/login': 'admin/admin_mgr_controller@adminLogin',
	'admin/mgr_permissions':'admin/admin_mgr_controller@permissions',
	'admin/mgr_list': 'admin/admin_mgr_controller@getMgrList',
	'admin/mgr_insert': 'admin/admin_mgr_controller@insertMgr#demo',
	'admin/mgr_del': 'admin/admin_mgr_controller@delMgr#demo',
	'admin/mgr_detail': 'admin/admin_mgr_controller@getMgrDetail',
	'admin/mgr_edit': 'admin/admin_mgr_controller@editMgr#demo',
	'admin/mgr_status': 'admin/admin_mgr_controller@statusMgr#demo',
	'admin/mgr_pwd': 'admin/admin_mgr_controller@pwdMgr#demo',
	'admin/log_list': 'admin/admin_mgr_controller@getLogList',
	'admin/log_clear': 'admin/admin_mgr_controller@clearLog#demo',

	'admin/setup_set': 'admin/admin_setup_controller@setSetup#demo',
	'admin/setup_set_content': 'admin/admin_setup_controller@setContentSetup#demo',
	'admin/setup_qr': 'admin/admin_setup_controller@genMiniQr',

	// 用户
	'admin/user_list': 'admin/admin_user_controller@getUserList',
	'admin/user_detail': 'admin/admin_user_controller@getUserDetail',
	'admin/user_del': 'admin/admin_user_controller@delUser#demo',
	'admin/user_status': 'admin/admin_user_controller@statusUser#demo',

	'admin/user_data_get': 'admin/admin_user_controller@userDataGet',
	'admin/user_data_export': 'admin/admin_user_controller@userDataExport',
	'admin/user_data_del': 'admin/admin_user_controller@userDataDel',


	// 内容  
	'home/list': 'home_controller@getHomeList',
	'news/list': 'news_controller@getNewsList',
	'news/view': 'news_controller@viewNews',

	'admin/news_list': 'admin/admin_news_controller@getAdminNewsList',
	'admin/news_insert': 'admin/admin_news_controller@insertNews#demo',
	'admin/news_detail': 'admin/admin_news_controller@getNewsDetail',
	'admin/news_edit': 'admin/admin_news_controller@editNews#demo',
	'admin/news_update_forms': 'admin/admin_news_controller@updateNewsForms#demo',
	'admin/news_update_pic': 'admin/admin_news_controller@updateNewsPic#demo',
	'admin/news_update_content': 'admin/admin_news_controller@updateNewsContent#demo',
	'admin/news_del': 'admin/admin_news_controller@delNews#demo',
	'admin/news_sort': 'admin/admin_news_controller@sortNews#demo',
	'admin/news_status': 'admin/admin_news_controller@statusNews#demo',
	'admin/news_vouch': 'admin/admin_news_controller@vouchNews#demo',

	// 相册
	'guide/list': 'guide_controller@getGuideList',
	'guide/view': 'guide_controller@viewGuide',

	'admin/guide_list': 'admin/admin_guide_controller@getAdminGuideList',
	'admin/guide_insert': 'admin/admin_guide_controller@insertGuide#demo',
	'admin/guide_detail': 'admin/admin_guide_controller@getGuideDetail',
	'admin/guide_edit': 'admin/admin_guide_controller@editGuide#demo#demo',
	'admin/guide_update_forms': 'admin/admin_guide_controller@updateGuideForms#demo',
	'admin/guide_del': 'admin/admin_guide_controller@delGuide#demo',
	'admin/guide_sort': 'admin/admin_guide_controller@sortGuide#demo',
	'admin/guide_vouch': 'admin/admin_guide_controller@vouchGuide#demo',
	'admin/guide_status': 'admin/admin_guide_controller@statusGuide#demo',

	// 产品 
	'spot/list': 'spot_controller@getSpotList',
	'spot/view': 'spot_controller@viewSpot',

	'admin/spot_list': 'admin/admin_spot_controller@getAdminSpotList',
	'admin/spot_insert': 'admin/admin_spot_controller@insertSpot#demo',
	'admin/spot_detail': 'admin/admin_spot_controller@getSpotDetail',
	'admin/spot_edit': 'admin/admin_spot_controller@editSpot#demo',
	'admin/spot_update_forms': 'admin/admin_spot_controller@updateSpotForms#demo',
	'admin/spot_del': 'admin/admin_spot_controller@delSpot#demo',
	'admin/spot_sort': 'admin/admin_spot_controller@sortSpot#demo',
	'admin/spot_vouch': 'admin/admin_spot_controller@vouchSpot#demo',
	'admin/spot_status': 'admin/admin_spot_controller@statusSpot#demo',

	// 预约
	'reservation/list': 'reservation_controller@getReservationList',
	'reservation/list_by_day': 'reservation_controller@getReservationListByDay',
	'reservation/list_has_day': 'reservation_controller@getHasDaysFromDay',
	'reservation/view': 'reservation_controller@viewReservation',
	'reservation/detail_for_join': 'reservation_controller@detailForJoin',
	'reservation/before_join': 'reservation_controller@beforeJoin',
	'reservation/join': 'reservation_controller@join',

	'reservation/my_join_list': 'reservation_controller@getMyJoinList',
	'reservation/my_join_cancel': 'reservation_controller@cancelMyJoin',
	'reservation/my_join_detail': 'reservation_controller@getMyJoinDetail',
	'reservation/my_join_someday': 'reservation_controller@getMyJoinSomeday',
	'reservation/my_join_checkin': 'reservation_controller@userSelfCheckin',

	'admin/reservation_list': 'admin/admin_reservation_controller@getAdminReservationList',
	'admin/reservation_join_list': 'admin/admin_reservation_controller@getJoinList',
	'admin/join_status': 'admin/admin_reservation_controller@statusJoin#demo',
	'admin/join_del': 'admin/admin_reservation_controller@delJoin#demo',
	'admin/reservation_insert': 'admin/admin_reservation_controller@insertReservation#demo',
	'admin/reservation_detail': 'admin/admin_reservation_controller@getReservationDetail',
	'admin/reservation_edit': 'admin/admin_reservation_controller@editReservation#demo',
	'admin/reservation_del': 'admin/admin_reservation_controller@delReservation#demo',
	'admin/reservation_update_content': 'admin/admin_reservation_controller@updateReservationContent#demo',
	'admin/reservation_update_style': 'admin/admin_reservation_controller@updateReservationStyleSet#demo',
	'admin/reservation_sort': 'admin/admin_reservation_controller@sortReservation#demo',
	'admin/reservation_vouch': 'admin/admin_reservation_controller@vouchReservation#demo',
	'admin/reservation_status': 'admin/admin_reservation_controller@statusReservation#demo',
	'admin/reservation_cancel_time_join': 'admin/admin_reservation_controller@cancelJoinByTimeMark#demo',
	'admin/join_scan': 'admin/admin_reservation_controller@scanJoin',
	'admin/join_checkin': 'admin/admin_reservation_controller@checkinJoin',
	'admin/self_checkin_qr': 'admin/admin_reservation_controller@genSelfCheckinQr',
	'admin/reservation_day_list': 'admin/admin_reservation_controller@getDayList',

	'admin/reservation_temp_insert': 'admin/admin_reservation_controller@insertReservationTemp#demo',
	'admin/reservation_temp_list': 'admin/admin_reservation_controller@getReservationTempList',
	'admin/reservation_temp_del': 'admin/admin_reservation_controller@delReservationTemp#demo',
	'admin/reservation_temp_edit': 'admin/admin_reservation_controller@editReservationTemp#demo',

	'admin/join_data_get': 'admin/admin_reservation_controller@joinDataGet',
	'admin/join_data_export': 'admin/admin_reservation_controller@joinDataExport',
	'admin/join_data_del': 'admin/admin_reservation_controller@joinDataDel',
 
}

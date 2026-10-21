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
	'album/list': 'album_controller@getAlbumList',
	'album/view': 'album_controller@viewAlbum',

	'admin/album_list': 'admin/admin_album_controller@getAdminAlbumList',
	'admin/album_insert': 'admin/admin_album_controller@insertAlbum#demo',
	'admin/album_detail': 'admin/admin_album_controller@getAlbumDetail',
	'admin/album_edit': 'admin/admin_album_controller@editAlbum#demo#demo',
	'admin/album_update_forms': 'admin/admin_album_controller@updateAlbumForms#demo',
	'admin/album_del': 'admin/admin_album_controller@delAlbum#demo',
	'admin/album_sort': 'admin/admin_album_controller@sortAlbum#demo',
	'admin/album_vouch': 'admin/admin_album_controller@vouchAlbum#demo',
	'admin/album_status': 'admin/admin_album_controller@statusAlbum#demo',

	// 产品 
	'product/list': 'product_controller@getProductList',
	'product/view': 'product_controller@viewProduct',

	'admin/product_list': 'admin/admin_product_controller@getAdminProductList',
	'admin/product_insert': 'admin/admin_product_controller@insertProduct#demo',
	'admin/product_detail': 'admin/admin_product_controller@getProductDetail',
	'admin/product_edit': 'admin/admin_product_controller@editProduct#demo',
	'admin/product_update_forms': 'admin/admin_product_controller@updateProductForms#demo',
	'admin/product_del': 'admin/admin_product_controller@delProduct#demo',
	'admin/product_sort': 'admin/admin_product_controller@sortProduct#demo',
	'admin/product_vouch': 'admin/admin_product_controller@vouchProduct#demo',
	'admin/product_status': 'admin/admin_product_controller@statusProduct#demo',

	// 预约
	'meet/list': 'meet_controller@getMeetList',
	'meet/list_by_day': 'meet_controller@getMeetListByDay',
	'meet/list_has_day': 'meet_controller@getHasDaysFromDay',
	'meet/view': 'meet_controller@viewMeet',
	'meet/detail_for_join': 'meet_controller@detailForJoin',
	'meet/before_join': 'meet_controller@beforeJoin',
	'meet/join': 'meet_controller@join',

	'meet/my_join_list': 'meet_controller@getMyJoinList',
	'meet/my_join_cancel': 'meet_controller@cancelMyJoin',
	'meet/my_join_detail': 'meet_controller@getMyJoinDetail',
	'meet/my_join_someday': 'meet_controller@getMyJoinSomeday',
	'meet/my_join_checkin': 'meet_controller@userSelfCheckin',

	'admin/meet_list': 'admin/admin_meet_controller@getAdminMeetList',
	'admin/meet_join_list': 'admin/admin_meet_controller@getJoinList',
	'admin/join_status': 'admin/admin_meet_controller@statusJoin#demo',
	'admin/join_del': 'admin/admin_meet_controller@delJoin#demo',
	'admin/meet_insert': 'admin/admin_meet_controller@insertMeet#demo',
	'admin/meet_detail': 'admin/admin_meet_controller@getMeetDetail',
	'admin/meet_edit': 'admin/admin_meet_controller@editMeet#demo',
	'admin/meet_del': 'admin/admin_meet_controller@delMeet#demo',
	'admin/meet_update_content': 'admin/admin_meet_controller@updateMeetContent#demo',
	'admin/meet_update_style': 'admin/admin_meet_controller@updateMeetStyleSet#demo',
	'admin/meet_sort': 'admin/admin_meet_controller@sortMeet#demo',
	'admin/meet_vouch': 'admin/admin_meet_controller@vouchMeet#demo',
	'admin/meet_status': 'admin/admin_meet_controller@statusMeet#demo',
	'admin/meet_cancel_time_join': 'admin/admin_meet_controller@cancelJoinByTimeMark#demo',
	'admin/join_scan': 'admin/admin_meet_controller@scanJoin',
	'admin/join_checkin': 'admin/admin_meet_controller@checkinJoin',
	'admin/self_checkin_qr': 'admin/admin_meet_controller@genSelfCheckinQr',
	'admin/meet_day_list': 'admin/admin_meet_controller@getDayList',

	'admin/meet_temp_insert': 'admin/admin_meet_controller@insertMeetTemp#demo',
	'admin/meet_temp_list': 'admin/admin_meet_controller@getMeetTempList',
	'admin/meet_temp_del': 'admin/admin_meet_controller@delMeetTemp#demo',
	'admin/meet_temp_edit': 'admin/admin_meet_controller@editMeetTemp#demo',

	'admin/join_data_get': 'admin/admin_meet_controller@joinDataGet',
	'admin/join_data_export': 'admin/admin_meet_controller@joinDataExport',
	'admin/join_data_del': 'admin/admin_meet_controller@joinDataDel',  
 
}

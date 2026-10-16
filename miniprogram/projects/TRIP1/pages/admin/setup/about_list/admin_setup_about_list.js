const AdminBiz=require('../../../../../../comm/biz/admin_biz.js');
Page({onLoad(){if(!AdminBiz.isAdmin(this))return;wx.redirectTo({url:'/projects/TRIP1/pages/admin/cms/list/cms_list?module=service'});}});

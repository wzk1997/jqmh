const PANORAMA_URL='https://wsvnvuzdlm.good360vr.com/preview/?id=2110674252908';
Page({data:{url:PANORAMA_URL,error:false},fail(){this.setData({error:true,url:''});},back(){if(getCurrentPages().length>1)wx.navigateBack();else wx.switchTab({url:'/projects/TRIP1/pages/default/index/default_index'});}});

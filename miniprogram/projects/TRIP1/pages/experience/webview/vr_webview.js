const VR_URL='https://www.good360vr.com/preview/?id=2109627847397';
Page({data:{url:VR_URL,error:false},fail(){this.setData({error:true,url:''});},back(){if(getCurrentPages().length>1)wx.navigateBack();else wx.switchTab({url:'/projects/TRIP1/pages/default/index/default_index'});}});

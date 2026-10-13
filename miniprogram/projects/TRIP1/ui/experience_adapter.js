const config = require('./scene_config.js');
function openARProvider(context) {
    if (typeof config.arProvider === 'function') return config.arProvider(context);
    wx.showToast({title:'实景导航暂未开放',icon:'none'});
    return false;
}
module.exports = { openARProvider };

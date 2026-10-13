function getChrome() {
    let info = {}, capsule = null;
    try { info = typeof wx.getWindowInfo === 'function' ? wx.getWindowInfo() : wx.getSystemInfoSync(); } catch (_) {}
    try { capsule = wx.getMenuButtonBoundingClientRect(); } catch (_) {}
    const width = info.windowWidth || 375;
    const status = Number.isFinite(info.statusBarHeight) ? info.statusBarHeight : 20;
    const validCapsule = capsule && capsule.height > 0 && capsule.left > 0 && capsule.top >= status;
    const rowTop = validCapsule ? Math.max(status, capsule.top + (capsule.height - 44) / 2) : status;
    const height = validCapsule ? Math.max(rowTop + 44, capsule.bottom + Math.max(0, capsule.top - status)) : status + 44;
    const right = validCapsule ? Math.max(12, width - capsule.left + 8) : 104;
    const safeBottom = info.safeArea && info.screenHeight ? Math.max(0, info.screenHeight - info.safeArea.bottom) : 0;
    const tabInset = 128 + safeBottom * 750 / width;
    return { status, height, rowTop, right, tabInset, safeBottom, width };
}
module.exports = { getChrome };

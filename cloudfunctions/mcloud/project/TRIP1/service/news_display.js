// Activity dates are calendar dates in the scenic site's China time zone.
function activityState(start, end, now = Date.now()) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(start || '') || !/^\d{4}-\d{2}-\d{2}$/.test(end || '') || end < start) return '';
    const today = new Date(now + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);
    return today < start ? 'upcoming' : today > end ? 'ended' : 'ongoing';
}
const labels = {upcoming:'即将开始', ongoing:'进行中', ended:'已结束'};
module.exports = {activityState, labels};

const AppError = require('../../../framework/core/app_error.js');
const fail = message => { throw new AppError(message); };
function text(value, label, max = 500, required = false) {
    if (value === undefined || value === null) value = '';
    if (typeof value !== 'string' || value.trim().length > max || (required && !value.trim())) fail(label + '格式或长度不正确');
    return value.trim();
}
function integer(value, label, min = 0, max = 9999, fallback = 9999) {
    if (value === undefined) return fallback;
    if (!Number.isInteger(value) || value < min || value > max) fail(label + '不正确');
    return value;
}
function id(value) { if (typeof value !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(value)) fail('记录标识不正确'); return value; }
function state(value) { if (!['draft', 'published', 'offline'].includes(value)) fail('发布状态不正确'); return value; }
function date(value) {
    const result=text(value,'活动日期',10);
    if (!result) return '';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(result)) fail('活动日期不正确');
    const parsed=new Date(result+'T00:00:00.000Z');
    if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0,10)!==result) fail('活动日期不正确');
    return result;
}
function content(value = []) {
    if (!Array.isArray(value) || value.length > 200 || JSON.stringify(value).length > 200000) fail('图文内容最多200段');
    return value.map(node => {
        if (!node || !['text', 'img'].includes(node.type)) fail('图文节点不正确');
        const result={ type: node.type, val: text(node.val, '图文内容', node.type === 'img' ? 600 : 10000, true) };
        if(node.format!==undefined) {
            if(node.type!=='text'||!node.format||typeof node.format!=='object'||Array.isArray(node.format))fail('段落格式不正确');
            const format={};
            for(const key of Object.keys(node.format)) {
                if(['bold','italic','underline'].includes(key)) {
                    if(typeof node.format[key]!=='boolean')fail('段落格式不正确');
                    format[key]=node.format[key];
                } else if(key==='align'&&['left','center','right'].includes(node.format[key]))format.align=node.format[key];
                else fail('段落格式不正确');
            }
            result.format=format;
        }
        return result;
    });
}
function images(value = [], max = 10) {
    if (!Array.isArray(value) || value.length > max) fail('图片数量不正确');
    return value.map(v => text(v, '图片', 600, true));
}
function forms(value = [], kind, staged = false) {
    if (!Array.isArray(value) || value.length > 30) fail('表单不正确');
    const allowed = kind === 'album' ? ['cover', 'desc', 'detail', 'spots'] : kind === 'news' ? ['desc', 'cover'] : ['cover', 'star', 'time', 'address', 'desc', 'traffic', 'ticket', 'other', 'album', 'latitude', 'longitude', 'subtitle', 'distance', 'duration', 'bestTime'];
    const seen = new Set();
    return value.map(item => {
        if (!item || !allowed.includes(item.mark) || seen.has(item.mark)) fail('表单字段不正确');
        seen.add(item.mark);
        let val, type = item.type;
        if (['cover', 'album'].includes(item.mark)) {
            if (type !== 'image') fail('图片字段类型不正确');
            val = images(item.val, item.mark === 'cover' ? 1 : 10);
            if (staged) val = val.filter(v => v.startsWith('cloud://') || v.startsWith('/images/'));
        } else if (item.mark === 'detail') {
            if (type !== 'content') fail('图文字段类型不正确');
            val = content(item.val);
            if (staged) val = val.filter(n => n.type !== 'img' || n.val.startsWith('cloud://') || n.val.startsWith('/images/'));
        } else if (item.mark === 'spots') {
            if (type !== 'select' || !Array.isArray(item.val) || item.val.length > 30) fail('关联景点不正确');
            val = item.val.map(id);
        } else {
            if (!['text','textarea','select','number'].includes(type)) fail('表单类型不正确');
            if(item.val != null && typeof item.val!=='string' && !(item.mark==='star' && typeof item.val==='number')) fail('字段内容类型不正确');
            val = text(String(item.val == null ? '' : item.val), '字段内容', ['desc','other'].includes(item.mark) ? 10000 : 500);
            if (item.mark === 'star' && val && !/^[1-5]$/.test(val)) fail('推荐指数不正确');
            if (['latitude','longitude'].includes(item.mark) && val && (!Number.isFinite(Number(val)) || Math.abs(Number(val)) > (item.mark === 'latitude' ? 90 : 180))) fail('坐标不正确');
        }
        return { mark: item.mark, type, title: text(item.title, '字段标题', 50), val };
    });
}
function phone(value) {
    const result = text(value, '联系电话', 30);
    if (result && !/^[+\d][\d\s()-]{4,29}$/.test(result)) fail('联系电话不正确');
    return result;
}
module.exports = { fail, date, text, integer, id, state, content, images, forms, phone };

const Cms = require('./admin/admin_cms_service.js');
const v = require('./cms_validation.js');
const DEFAULTS = {
    news:[{id:'activity',name:'景区活动'},{id:'announcement',name:'景区公告'},{id:'tips',name:'旅游资讯'},{id:'1',name:'景区动态'},{id:'2',name:'美食'},{id:'3',name:'特产'}],
    album:[{id:'1',name:'线路'},{id:'2',name:'吃喝'},{id:'3',name:'住宿'},{id:'4',name:'购物'},{id:'5',name:'其他'}],
    product:[{id:'1',name:'仙山贡水'},{id:'2',name:'伍家台'},{id:'3',name:'狮子关'},{id:'4',name:'其他景点'}]
};
async function categories(module) {
    if(!DEFAULTS[module])v.fail('分类模块不正确');
    const service=new Cms(),Model=Cms.models.category;await service.ensure(Model);
    const rows=await Model.getAll({CONTENT_CATEGORY_MODULE:module},'*',{CONTENT_CATEGORY_ORDER:'asc'},100);
    const list=DEFAULTS[module].map(item=>({...item,legacy:true}));
    for(const row of rows){const existing=list.findIndex(c=>c.id===row.CONTENT_CATEGORY_KEY);if(row.CONTENT_CATEGORY_DELETED || row.CONTENT_CATEGORY_STATE==='offline'){if(existing>=0)list.splice(existing,1);continue;}if(row.CONTENT_CATEGORY_STATE!=='published')continue;const item={id:row.CONTENT_CATEGORY_KEY,name:row.CONTENT_CATEGORY_NAME,recordId:row._id};const i=list.findIndex(c=>c.id===item.id);if(i>=0)list[i]=item;else list.push(item);}
    return list;
}
async function list(module,input) {
    if(!['scenic','merchant'].includes(module))v.fail('公开模块不正确');
    const result=await new Cms().list(module,input,true);
    result.list=result.list.map(row=>publicRow(module,row));return result;
}
function publicRow(module,row) {
    const p=module.toUpperCase()+'_', data={_id:row._id};
    const fields=module==='merchant'?['NAME','CATEGORY','DESC','PHONE','ADDRESS','HOURS','IMAGES','CONTENT']:['NAME','DESC','ADDRESS','HOURS','PHONE','IMAGES','CONTENT','INFO'];
    fields.push('DEMO');for(const f of fields)data[p+f]=row[p+f];data[p+'PUBLISH_TIME']=row[p+'PUBLISH_TIME'];return data;
}
async function detail(module,id) {
    if(!['scenic','merchant'].includes(module))v.fail('公开模块不正确');
    const cms=new Cms(),Model=cms.model(module);await cms.ensure(Model);
    const row=await Model.getOne(v.id(id));
    if(!row || row[module.toUpperCase()+'_DELETED'] || Cms.currentState(module,row)!=='published')v.fail('内容尚未发布');return publicRow(module,row);
}
module.exports={categories,list,detail};

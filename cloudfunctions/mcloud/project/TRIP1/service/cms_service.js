const Cms = require('./admin/admin_cms_service.js');
const v = require('./cms_validation.js');
async function categories(module) {
    if(!['news','album','product'].includes(module))v.fail('分类模块不正确');
    const service=new Cms(),Model=Cms.models.category;await service.ensure(Model);
    const rows=await Model.getAll({CONTENT_CATEGORY_MODULE:module},'*',{CONTENT_CATEGORY_ORDER:'asc'},100);
    const list=rows.filter(row=>!row.CONTENT_CATEGORY_DELETED&&row.CONTENT_CATEGORY_STATE==='published').map(row=>({id:row.CONTENT_CATEGORY_KEY,name:row.CONTENT_CATEGORY_NAME,recordId:row._id}));
    return list;
}
async function list(module,input) {
    if(!['scenic','merchant','service'].includes(module))v.fail('公开模块不正确');
    const result=await new Cms().list(module,input,true);
    result.list=result.list.map(row=>publicRow(module,row));return result;
}
function publicRow(module,row) {
    const p=module.toUpperCase()+'_', data={_id:row._id};
    const fields=module==='merchant'?['NAME','CATEGORY','DESC','PHONE','ADDRESS','HOURS','IMAGES','CONTENT']:['NAME','DESC','ADDRESS','HOURS','PHONE','IMAGES','CONTENT','INFO'];
    if(module==='service')fields.splice(fields.indexOf('INFO'),1);
    fields.push('DEMO');for(const f of fields)data[p+f]=row[p+f];data[p+'PUBLISH_TIME']=row[p+'PUBLISH_TIME'];return data;
}
async function detail(module,id) {
    if(!['scenic','merchant','service'].includes(module))v.fail('公开模块不正确');
    const cms=new Cms(),Model=cms.model(module);await cms.ensure(Model);
    const row=await Model.getOne(v.id(id));
    if(!row || row[module.toUpperCase()+'_DELETED'] || Cms.currentState(module,row)!=='published')v.fail('内容尚未发布');return publicRow(module,row);
}
module.exports={categories,list,detail};

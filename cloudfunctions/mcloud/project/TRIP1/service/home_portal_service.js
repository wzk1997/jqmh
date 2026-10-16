const setup=require('../../../framework/utils/setup/setup_util.js');
const Cms=require('./admin/admin_cms_service.js');
const publicCms=require('./cms_service.js');
const v=require('./cms_validation.js');
const KEY='SETUP_HOME_PORTAL';
const TYPES=['scenic','album','product','news','merchant'];
function reference(ref){
 if(!ref||!TYPES.includes(ref.module))v.fail('首页内容类型不正确');
 return {module:ref.module,id:v.id(ref.id)};
}
function selectConfig(config){
 if(!config)return null;
 return {brandName:config.brandName||'江纺1953',slides:(config.slides||[]).map(row=>({image:row.image,title:row.title,subtitle:row.subtitle||'',enabled:row.enabled!==false,target:row.target||null}))};
}
function validate(input){
 if(!input||typeof input!=='object'||Array.isArray(input))v.fail('首页配置不正确');
 const slides=input.slides||[];
 if(!Array.isArray(slides)||slides.length>8)v.fail('轮播最多8张');
 return {brandName:v.text(input.brandName,'品牌名称',30)||'江纺1953',slides:slides.map(row=>{
  if(!row||typeof row!=='object')v.fail('轮播配置不正确');
  if(row.enabled!==undefined&&typeof row.enabled!=='boolean')v.fail('轮播启用状态不正确');
  return {image:v.text(row.image,'轮播图片',600,true),title:v.text(row.title,'轮播标题',60,true),subtitle:v.text(row.subtitle,'轮播副标题',120),enabled:row.enabled!==false,target:row.target?reference(row.target):null};
 })};
}
class HomePortalService {
 async get(){const record=await setup.get(KEY)||{};return {...record,draft:selectConfig(record.draft),published:selectConfig(record.published)};}
 async resolve(ref){
  if(!ref||!TYPES.includes(ref.module))return null;
  const cms=new Cms(),Model=cms.model(ref.module);await cms.ensure(Model);
  const p=ref.module.toUpperCase()+'_',row=await Model.getOne({_id:ref.id,[p+'DELETED']:['<>',true]});
  if(!row||Cms.currentState(ref.module,row)!=='published')return null;
  if(['scenic','merchant'].includes(ref.module))return await publicCms.detail(ref.module,ref.id);
  return {id:row._id,title:row[p+'TITLE']};
 }
 async validateResources(config,record,requirePublished){
  const cms=new Cms(),previous=[record.draft,record.published].filter(Boolean).flatMap(c=>(c.slides||[]).map(s=>s.image));
  await cms.checkImages('home_portal',KEY,config.slides.map(s=>s.image),previous);
  for(const ref of config.slides.filter(s=>s.target).map(s=>s.target)){
   await cms.detail(ref.module,ref.id);if(requirePublished&&!await this.resolve(ref))v.fail('关联内容尚未发布');
  }
 }
 async upload(base64,adminId){return new Cms().uploadAsset('home_portal',KEY,base64,adminId);}
 async save(input,adminId){const config=validate(input),old=await this.get();await this.validateResources(config,old,false);await require('../../../framework/validate/content_check.js').checkTextMultiAdmin(config);await setup.replace(KEY,{...old,draft:config,editAdmin:adminId,editTime:Date.now()},'home_portal');return {saved:true};}
 async publish(adminId){const old=await this.get();if(!old.draft)v.fail('没有待发布的首页配置');const config=validate(old.draft);await this.validateResources(config,old,true);await setup.replace(KEY,{...old,published:config,publishAdmin:adminId,publishTime:Date.now()},'home_portal');return {published:true};}
 async portal(){const {published:config}=await this.get();if(!config)return {configured:false,slides:[]};
  const slides=[];for(const row of config.slides){if(!row.enabled)continue;if(row.target&&!await this.resolve(row.target))continue;slides.push(row);}
  return {configured:true,brandName:config.brandName,slides};
 }
}
HomePortalService.validate=validate;HomePortalService.KEY=KEY;
module.exports=HomePortalService;

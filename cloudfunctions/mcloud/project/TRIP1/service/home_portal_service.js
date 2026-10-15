const setup=require('../../../framework/utils/setup/setup_util.js');
const Cms=require('./admin/admin_cms_service.js');
const publicCms=require('./cms_service.js');
const v=require('./cms_validation.js');
const KEY='SETUP_HOME_PORTAL';
const TYPES=['scenic','guide','spot','news','merchant','panorama'];
function reference(ref){
 if(!ref||!TYPES.includes(ref.module))v.fail('首页内容类型不正确');
 return {module:ref.module,id:v.id(ref.id)};
}
function validate(input){
 if(!input||typeof input!=='object'||Array.isArray(input))v.fail('首页配置不正确');
 const slides=input.slides||[],featured=input.featured||[];
 if(!Array.isArray(slides)||slides.length>8||!Array.isArray(featured)||featured.length>12)v.fail('轮播最多8张，推荐最多12项');
 const seen=new Set();
 return {scenicId:input.scenicId?v.id(input.scenicId):'',brandName:v.text(input.brandName,'品牌名称',30)||'WeTravel',
  slides:slides.map(row=>{if(!row||typeof row!=='object')v.fail('轮播配置不正确');if(row.enabled!==undefined&&typeof row.enabled!=='boolean')v.fail('轮播启用状态不正确');return {image:v.text(row.image,'轮播图片',600,true),title:v.text(row.title,'轮播标题',60,true),subtitle:v.text(row.subtitle,'轮播副标题',120),enabled:row.enabled!==false,target:row.target?reference(row.target):null};}),
  featured:featured.map(row=>{const ref=reference(row),key=ref.module+':'+ref.id;if(seen.has(key))v.fail('推荐内容不能重复');seen.add(key);return ref;})};
}
class HomePortalService {
 async get(){return await setup.get(KEY)||{draft:null,published:null};}
 async resolve(ref){
  const cms=new Cms(),Model=cms.model(ref.module);await cms.ensure(Model);
  const p=ref.module.toUpperCase()+'_',row=await Model.getOne({_id:ref.id,[p+'DELETED']:['<>',true]});
  if(!row||Cms.currentState(ref.module,row)!=='published')return null;
  if(['scenic','merchant','panorama'].includes(ref.module))return await publicCms.detail(ref.module,ref.id);
  const obj=row[p+'OBJ']||{};
  return {id:row._id,type:ref.module,title:row[p+'TITLE'],desc:row[p+'DESC']||obj.desc||'',pic:(row[p+'PIC']||obj.cover||[])[0]||'',cateId:row[p+'CATE_ID'],cateName:row[p+'CATE_NAME'],demo:!!row[p+'DEMO']};
 }
 async validateResources(config,previous,requirePublished){
  const cms=new Cms();
  if(config.slides.length&&!config.scenicId)v.fail('请先关联景区再配置轮播');
  if(config.scenicId){const row=await cms.detail('scenic',config.scenicId);if(requirePublished&&!await this.resolve({module:'scenic',id:config.scenicId}))v.fail('关联景区尚未发布');
   await cms.checkImages('scenic',config.scenicId,config.slides.map(s=>s.image),[...(row.SCENIC_IMAGES||[]),...((previous&&previous.slides)||[]).map(s=>s.image)]);
  }
  for(const ref of [...config.featured,...config.slides.filter(s=>s.target).map(s=>s.target)]){
   await cms.detail(ref.module,ref.id);if(requirePublished&&!await this.resolve(ref))v.fail('关联内容尚未发布');
  }
 }
 async save(input,adminId){const config=validate(input),old=await this.get();await this.validateResources(config,old.draft||old.published,false);await require('../../../framework/validate/content_check.js').checkTextMultiAdmin(config);await setup.replace(KEY,{...old,draft:config,editAdmin:adminId,editTime:Date.now()},'home_portal');return {saved:true};}
 async publish(adminId){const old=await this.get();if(!old.draft)v.fail('没有待发布的首页配置');const config=validate(old.draft);await this.validateResources(config,old.published,true);await setup.replace(KEY,{...old,published:config,publishAdmin:adminId,publishTime:Date.now()},'home_portal');return {published:true};}
 async portal(){const record=await this.get(),config=record.published;if(!config)return {configured:false,slides:[],scenic:null,featured:[]};
  const scenic=config.scenicId?await this.resolve({module:'scenic',id:config.scenicId}):null;
  const slides=[];for(const row of scenic?config.slides||[]:[]){if(!row.enabled)continue;if(row.target&&!await this.resolve(row.target))continue;slides.push(row);}
  const featured=(await Promise.all(config.featured.map(ref=>this.resolve(ref)))).filter(Boolean);
  return {configured:true,brandName:config.brandName,slides,scenic,featured};
 }
}
HomePortalService.validate=validate;HomePortalService.KEY=KEY;
module.exports=HomePortalService;

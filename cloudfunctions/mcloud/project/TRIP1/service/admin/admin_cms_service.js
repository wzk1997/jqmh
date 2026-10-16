const BaseService = require('./base_project_admin_service.js');
const v = require('../cms_validation.js');
const dbUtil = require('../../../../framework/database/db_util.js');
const dataUtil = require('../../../../framework/utils/data_util.js');
const contentCheck = require('../../../../framework/validate/content_check.js');
const cloudBase = require('../../../../framework/cloud/cloud_base.js');
const util = require('../../../../framework/utils/util.js');
const crypto = require('crypto');
const models = {
    scenic: require('../../model/scenic_model.js'),
    news: require('../../model/news_model.js'), album: require('../../model/album_model.js'),
    product: require('../../model/product_model.js'), merchant: require('../../model/merchant_model.js'),
    category: require('../../model/content_category_model.js')
};
const Asset = require('../../model/cms_asset_model.js');
const prefix = kind => kind === 'category' ? 'CONTENT_CATEGORY_' : kind.toUpperCase() + '_';
const legacy = kind => ['news','album','product'].includes(kind);
const stateField = kind => prefix(kind) + (legacy(kind) ? 'CMS_STATE' : 'STATE');
function currentState(kind, row) { return row[stateField(kind)] || (row[prefix(kind)+'STATUS'] === 1 ? 'published' : 'offline'); }
class AdminCmsService extends BaseService {
    model(kind) { if (!models[kind]) v.fail('管理模块不正确'); return models[kind]; }
    async ensure(Model) {
        if (!await dbUtil.isExistCollection(Model.CL)) {
            await dbUtil.createCollection(Model.CL);
            if (!await dbUtil.isExistCollection(Model.CL)) v.fail('数据集合暂不可用');
        }
    }
    async detail(kind, id) {
        const Model = this.model(kind); await this.ensure(Model);
        const row = await Model.getOne(v.id(id));
        if (!row || row[prefix(kind)+'DELETED']) v.fail('内容不存在或已删除');
        const draft = row[prefix(kind)+'DRAFT'];
        return { ...row, ...(draft || {}), cmsState: currentState(kind, row), hasDraft: !!(draft && Object.keys(draft).length) };
    }
    async list(kind, input = {}, publicOnly = false) {
        const Model = this.model(kind); await this.ensure(Model); const p = prefix(kind);
        const page = v.integer(input.page, '页码', 1, 10000, 1);
        const size = v.integer(input.size, '每页数量', 1, 50, 20);
        const search = v.text(input.search, '搜索', 50);
        const where = { and: { _pid: util.getProjectId(), [p+'DELETED']: ['<>', true] } };
        if (publicOnly) where.and[legacy(kind)?p+'STATUS':stateField(kind)] = legacy(kind)?1:'published';
        else if (input.state) {
            const state=v.state(input.state);
            if(legacy(kind)&&state==='published')where.and[p+'STATUS']=1;
            else where.and[stateField(kind)]=state;
        }
        if (input.category) where.and[p+(legacy(kind)?'CATE_ID':'CATEGORY')] = v.text(input.category, '分类', 80);
        if (kind === 'category') where.and[p+'MODULE'] = v.text(input.module, '模块', 30, true);
        if (search) where.and[p+(legacy(kind) ? 'TITLE' : 'NAME')] = ['like', search];
        const result = await Model.getList(where, '*', { [p+'ORDER']: 'asc', [p+'ADD_TIME']: 'desc' }, page, size, true, 0);
        result.list = result.list.map(row => ({ ...row, cmsState: currentState(kind,row) }));
        return result;
    }
    async reserveDemo(key,adminId){
        const spec=require('../../public/cms_demo_data.js').find(row=>row.key===key);if(!spec)v.fail('演示内容标识不正确');
        const kind=spec.module,Model=this.model(kind),p=prefix(kind),id='wt_demo_'+spec.key;await this.ensure(Model);
        const existing=await Model.getOne(id);if(existing)return {id,created:false,module:kind};
        const row={_id:id,[p+'DEMO']:true,[p+'ORDER']:spec.data.order,[p+'EDIT_ADMIN']:adminId,[stateField(kind)]:'draft'};
        if(legacy(kind))Object.assign(row,{[p+'TITLE']:spec.name,[p+'CATE_ID']:spec.data.cateId,[p+'CATE_NAME']:await this.category(kind,spec.data.cateId),[p+'STATUS']:0});
        else row[p+'NAME']=spec.name;
        await Model.insert(row);return {id,created:true,module:kind};
    }
    async spots(input={}) {
        const Model=models.product;await this.ensure(Model);
        const page=v.integer(input.page,'页码',1,10000,1),size=v.integer(input.size,'每页数量',1,50,50);
        const ids=input.ids===undefined?[]:input.ids;if(!Array.isArray(ids)||ids.length>30)v.fail('关联景点不正确');
        const keys=[...new Set(ids.map(v.id))];
        const where={PRODUCT_STATUS:1,PRODUCT_DELETED:['<>',true]};
        const fields='_id,PRODUCT_TITLE,PRODUCT_OBJ';
        const normalize=row=>({id:row._id,name:row.PRODUCT_TITLE,cover:((row.PRODUCT_OBJ||{}).cover||[])[0]||'',available:true});
        const result=await Model.getList(where,fields,{PRODUCT_ORDER:'asc',PRODUCT_ADD_TIME:'desc'},page,size,true,0);
        const selected=await Promise.all(keys.map(async id=>{const row=await Model.getOne({...where,_id:id},fields);return row?normalize(row):{id,name:'景点已下架或不可用',cover:'',available:false};}));
        return {...result,list:result.list.map(normalize),selected};
    }
    async checkImages(kind, id, values, previous = []) {
        const cloud = cloudBase.getCloud();
        const path = '/' + util.getProjectId() + '/' + kind + '/' + id + '/';
        for (const fileID of [...new Set(values)]) {
            if (previous.includes(fileID)) continue; // Previously stored legacy assets remain compatible.
            if (!fileID.startsWith('cloud://') || !fileID.includes(path)) v.fail('图片资源不属于当前内容');
            const result = await cloud.downloadFile({ fileID });
            const b = result.fileContent;
            if (!Buffer.isBuffer(b) || !b.length || b.length > 5*1024*1024) v.fail('图片须在5MB以内');
            const png = b.length >= 8 && b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
            const jpg = b.length >= 3 && b[0] === 255 && b[1] === 216 && b[2] === 255;
            if (!png && !jpg) v.fail('仅支持JPG、PNG图片');
            await contentCheck.checkImgAdmin(b.toString('base64'), png ? 'png' : 'jpeg');
        }
    }
    assetValues(row, kind) {
        if (!row) return [];
        const p = prefix(kind), values = [];
        values.push(...(row[p+'PIC'] || []), ...(row[p+'IMAGES'] || []), ...(row[p+'COVER'] || []));
        for (const n of row[p+'CONTENT'] || []) if (n.type === 'img') values.push(n.val);
        for (const f of row[p+'FORMS'] || []) {
            if (f.type === 'image') values.push(...f.val);
            if (f.type === 'content') for (const n of f.val) if (n.type === 'img') values.push(n.val);
        }
        // Old content can have OBJ without FORMS.
        const obj = row[p+'OBJ'] || {};
        values.push(...(Array.isArray(obj.cover)?obj.cover:[]), ...(Array.isArray(obj.album)?obj.album:[]));
        for (const n of obj.detail || []) if (n.type === 'img') values.push(n.val);
        return values;
    }
    async category(kind, key, name) {
        key = v.text(key, '分类编号', 80, true);
        await this.ensure(models.category);
        const category = await models.category.getOne({CONTENT_CATEGORY_MODULE:kind,CONTENT_CATEGORY_KEY:key});
        if(category && (category.CONTENT_CATEGORY_DELETED || category.CONTENT_CATEGORY_STATE==='offline'))v.fail('分类已停用');
        if(category && category.CONTENT_CATEGORY_STATE==='published')return category.CONTENT_CATEGORY_NAME;
        v.fail('分类不存在或尚未发布');
    }
    async saveLegacy(kind, input, adminId = '', staged = false) {
        const Model=this.model(kind),p=prefix(kind); await this.ensure(Model);
        const existing = input.id ? await this.detail(kind,input.id) : null;
        const title=v.text(input.title,'标题',50,true), order=v.integer(input.order,'排序'),
              cateName=await this.category(kind,input.cateId,input.cateName);
        const forms=v.forms(input.forms || [],kind,staged);
        for(const f of forms)if(f.mark==='spots')for(const spot of f.val)await this.detail('product',spot);
        const data={ [p+'TITLE']:title,[p+'ORDER']:order,[p+'CATE_ID']:String(input.cateId),[p+'CATE_NAME']:cateName,[p+'FORMS']:forms,[p+'OBJ']:dataUtil.dbForms2Obj(forms),[p+'EDIT_ADMIN']:adminId };
        if(kind==='album'){
            if(input.duration!==undefined)data.ALBUM_DURATION=v.text(input.duration,'游玩时长',50);
            if(input.route!==undefined){
                if(!Array.isArray(input.route)||input.route.length>30)v.fail('路线节点不正确');
                const linked=(forms.find(f=>f.mark==='spots')||{val:[]}).val,seen=new Set();
                data.ALBUM_ROUTE=input.route.map(node=>{if(!node||!linked.includes(node.spotId)||seen.has(node.spotId))v.fail('路线节点需关联有效景点且不能重复');seen.add(node.spotId);return {spotId:v.id(node.spotId),duration:v.text(node.duration,'节点时长',50),note:v.text(node.note,'节点说明',300),highlight:v.text(node.highlight,'路线亮点标题',30)};});
            }
        }
        if(kind==='news') {
            data.NEWS_DESC=v.text(input.desc,'简介',200);
            if(input.images!==undefined)data.NEWS_PIC=v.images(input.images,3);
            if(input.content!==undefined)data.NEWS_CONTENT=v.content(input.content);
            for(const field of ['activityStart','activityEnd'])if(input[field]!==undefined){const value=v.date(input[field]);data[field==='activityStart'?'NEWS_ACTIVITY_START':'NEWS_ACTIVITY_END']=value;}
            if(data.NEWS_ACTIVITY_START&&data.NEWS_ACTIVITY_END&&data.NEWS_ACTIVITY_END<data.NEWS_ACTIVITY_START)v.fail('活动结束日期不能早于开始日期');
        }
        const id=existing?input.id:crypto.randomBytes(16).toString('hex');
        await this.checkImages(kind,id,this.assetValues(data,kind),this.assetValues(existing,kind));
        await contentCheck.checkTextMultiAdmin(data);
        if(existing) await this.persistDraft(Model,kind,id,data,existing);
        else await Model.insert({_id:id,...data,[stateField(kind)]:'draft',[p+'STATUS']:0});
        return {id};
    }
    async patchLegacy(kind, id, field, value) {
        const row=await this.detail(kind,id),Model=this.model(kind),p=prefix(kind); let data={};
        if(field==='forms') {
            const patch=v.forms(value,kind);
            const forms=(row[p+'FORMS']||[]).map(f=>patch.find(n=>n.mark===f.mark)||f);
            for(const f of patch) if(!forms.find(n=>n.mark===f.mark)) forms.push(f);
            data={[p+'FORMS']:forms,[p+'OBJ']:dataUtil.dbForms2Obj(forms)};
        } else if(field==='pic') data={[p+'PIC']:v.images(value,3)};
        else if(field==='content') data={[p+'CONTENT']:v.content(value)};
        else v.fail('更新字段不正确');
        await this.checkImages(kind,id,this.assetValues(data,kind),this.assetValues(row,kind));
        await contentCheck.checkTextMultiAdmin(data); await this.persistDraft(Model,kind,id,data,row);
        return {id,urls:data[p+'PIC']||[]};
    }
    async save(kind, input, adminId) {
        if(legacy(kind)) return this.saveLegacy(kind,input,adminId);
        const Model=this.model(kind),p=prefix(kind);await this.ensure(Model);
        const row=input.id?await this.detail(kind,input.id):null;
        let data={[p+'NAME']:v.text(input.name,'名称',80,true),[p+'ORDER']:v.integer(input.order,'排序'),[p+'EDIT_ADMIN']:adminId};
        if(kind==='scenic') {
            Object.assign(data,{SCENIC_DESC:v.text(input.desc,'简介',500),SCENIC_ADDRESS:v.text(input.address,'地址',300),SCENIC_HOURS:v.text(input.hours,'开放时间',100),SCENIC_PHONE:v.phone(input.phone),SCENIC_IMAGES:v.images(input.images),SCENIC_CONTENT:v.content(input.content)});
            if(input.info!==undefined)data.SCENIC_INFO=require('../scenic_info_validation.js')(input.info,data.SCENIC_IMAGES);
        } else if(kind==='merchant') {
            if(!['food','stay','travel'].includes(input.category)) v.fail('商家分类不正确');
            Object.assign(data,{MERCHANT_CATEGORY:input.category,MERCHANT_DESC:v.text(input.desc,'简介',500),MERCHANT_PHONE:v.phone(input.phone),MERCHANT_ADDRESS:v.text(input.address,'地址',300),MERCHANT_HOURS:v.text(input.hours,'营业时间',100),MERCHANT_IMAGES:v.images(input.images),MERCHANT_CONTENT:v.content(input.content)});
        } else if(kind==='category') {
            if(!['news','album','product'].includes(input.module)) v.fail('分类模块不正确');
            const key=v.id(input.key);
            if(row && key!==row.CONTENT_CATEGORY_KEY)v.fail('不能修改已有分类编号');
            const found=await Model.getOne({CONTENT_CATEGORY_MODULE:input.module,CONTENT_CATEGORY_KEY:key});
            if(found && (!row || found._id!==input.id)) v.fail('分类编号已存在');
            Object.assign(data,{CONTENT_CATEGORY_MODULE:input.module,CONTENT_CATEGORY_KEY:key});
        }
        const id=row?input.id:crypto.randomBytes(16).toString('hex');
        const imgs=this.assetValues(data,kind);
        const prev=this.assetValues(row,kind);
        await this.checkImages(kind,id,imgs,prev);await contentCheck.checkTextMultiAdmin(data);
        if(row)await this.persistDraft(Model,kind,id,data,row);
        else await Model.insert({_id:id,...data,[stateField(kind)]:'draft'});
        return {id};
    }
    async persistDraft(Model,kind,id,data,row) {
        const p=prefix(kind);
        if(row.cmsState==='published' || row.hasDraft) {
            await this.replaceContent(Model,id,{[p+'DRAFT']:{...(row[p+'DRAFT']||{}),...data},[p+'EDIT_ADMIN']:data[p+'EDIT_ADMIN']||row[p+'EDIT_ADMIN']||''});
        } else await this.replaceContent(Model,id,data);
    }
    async replaceContent(Model,id,data) {
        const fields=Object.keys(data).filter(key=>data[key] && data[key].constructor===Object);
        return Model.edit(id,data,true,fields);
    }
    async setState(kind,id,state,adminId='') {
        const row=await this.detail(kind,id),Model=this.model(kind),p=prefix(kind); state=v.state(state);
        if(state==='published') {
            if(legacy(kind))await this.category(kind,row[p+'CATE_ID']);
            if(kind==='album')for(const id of (row.ALBUM_OBJ.spots||[])){const spot=await this.detail('product',id);if(spot.cmsState!=='published')v.fail('关联景点尚未发布');}
            if(kind==='scenic' && row.SCENIC_INFO)require('../scenic_info_validation.js')(row.SCENIC_INFO,row.SCENIC_IMAGES||[]);
            if(kind==='scenic' && (!row.SCENIC_IMAGES.length || !row.SCENIC_CONTENT.length)) v.fail('请完善景区图片与介绍');
            if(kind==='news' && (!(row.NEWS_PIC||[]).length || !(row.NEWS_CONTENT||[]).length)) v.fail('请先完善封面与正文');
            if(['album','product'].includes(kind) && !(row[p+'OBJ']&&row[p+'OBJ'].cover&&row[p+'OBJ'].cover.length)) v.fail('请先上传封面');
            if(kind==='album' && !(row.ALBUM_OBJ.detail||[]).length) v.fail('请先完善攻略正文');
            if(kind==='merchant' && (!row.MERCHANT_PHONE || !row.MERCHANT_ADDRESS || !row.MERCHANT_IMAGES.length)) v.fail('请完善电话、地址和图片');
        }
        const data={[stateField(kind)]:state,[p+'EDIT_ADMIN']:adminId};
        if(state==='published' && row.hasDraft){Object.assign(data,row[p+'DRAFT']);data[p+'DRAFT']={};}
        if(legacy(kind))data[p+'STATUS']=state==='published'?1:0;
        if(state==='published' && !row[p+'PUBLISH_TIME'])data[p+'PUBLISH_TIME']=Date.now();
        await this.replaceContent(Model,id,data);return {id,state};
    }
    async assertCategoryUnused(module,key) {
        if(!['news','album','product'].includes(module))v.fail('分类模块不正确');
        await this.ensure(models[module]);
        const p=prefix(module);
        const where={and:{[p+'DELETED']:['<>',true]},or:[{[p+'CATE_ID']:key},{[p+'DRAFT.'+p+'CATE_ID']:key}]};
        if(await models[module].count(where))v.fail('分类仍有内容或草稿使用，请先调整内容分类');
    }
    async remove(kind,id,adminId='') {
        const row=await this.detail(kind,id),p=prefix(kind);
        if(kind==='category') {
            const module=row.CONTENT_CATEGORY_MODULE;
            await this.assertCategoryUnused(module,row.CONTENT_CATEGORY_KEY);
        }
        const data={[p+'DELETED']:true,[stateField(kind)]:'deleted',[p+'EDIT_ADMIN']:adminId};
        if(legacy(kind)){data[p+'STATUS']=0;data[p+'DELETED_TIME']=Date.now();}
        await this.model(kind).edit(id,data);return {id};
    }
    async sort(kind,id,order) { await this.detail(kind,id); await this.model(kind).edit(id,{[prefix(kind)+'ORDER']:v.integer(order,'排序')}); }
    async upload(kind,id,base64,adminId) {
        this.model(kind);await this.detail(kind,id);return this.uploadAsset(kind,id,base64,adminId);
    }
    async uploadAsset(kind,id,base64,adminId) {
        await this.ensure(Asset);
        if(typeof base64!=='string'||base64.length>7*1024*1024||!base64.length||!/^[A-Za-z0-9+/]+={0,2}$/.test(base64))v.fail('图片数据不正确');
        const b=Buffer.from(base64,'base64');
        if(!b.length||b.length>5*1024*1024)v.fail('图片须在5MB以内');
        const png=b.length>=8&&b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
        const jpg=b.length>=3&&b[0]===255&&b[1]===216&&b[2]===255;
        if(!png&&!jpg)v.fail('仅支持JPG、PNG图片');
        await contentCheck.checkImgAdmin(base64,png?'png':'jpeg');
        const result=await cloudBase.getCloud().uploadFile({cloudPath:util.getProjectId()+'/'+kind+'/'+id+'/'+crypto.randomBytes(16).toString('hex')+(png?'.png':'.jpg'),fileContent:b});
        await Asset.insert({CMS_ASSET_FILE_ID:result.fileID,CMS_ASSET_MODULE:kind,CMS_ASSET_RECORD_ID:id,CMS_ASSET_ADMIN_ID:adminId,CMS_ASSET_SIZE:b.length,CMS_ASSET_MIME:png?'image/png':'image/jpeg'});
        return {fileID:result.fileID};
    }
}
AdminCmsService.models=models;AdminCmsService.currentState=currentState;
module.exports=AdminCmsService;

const crypto = require('crypto');
const BaseService = require('../../../framework/platform/service/base_service.js');
const FeedbackAsset=require('../model/feedback_asset_model.js');
const FeedbackModel = require('../model/feedback_model.js');
const dbUtil = require('../../../framework/database/db_util.js');
const util = require('../../../framework/utils/util.js');
const contentCheck = require('../../../framework/validate/content_check.js');
const cloudBase = require('../../../framework/cloud/cloud_base.js');

class FeedbackService extends BaseService {
    async ensureCollection() {
        if (!await dbUtil.isExistCollection(FeedbackModel.CL)) {
            const created = await dbUtil.createCollection(FeedbackModel.CL);
            if (!created && !await dbUtil.isExistCollection(FeedbackModel.CL)) {
                this.AppError('客户反馈服务暂不可用，请稍后重试');
            }
        }
    }
    async upload(userId,input) {
        if(!input||typeof input.requestId!=='string'||!/^[a-zA-Z0-9_-]{16,64}$/.test(input.requestId))this.AppError('提交标识不正确');
        if(typeof input.base64!=='string'||input.base64.length>7*1024*1024||!/^[A-Za-z0-9+/]+={0,2}$/.test(input.base64))this.AppError('图片数据不正确');
        const b=Buffer.from(input.base64,'base64');if(!b.length||b.length>5*1024*1024)this.AppError('图片须在5MB以内');
        const png=b.length>=8&&b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),jpg=b.length>=3&&b[0]===255&&b[1]===216&&b[2]===255;
        if(!png&&!jpg)this.AppError('仅支持JPG、PNG图片');
        if(!await dbUtil.isExistCollection(FeedbackAsset.CL))await dbUtil.createCollection(FeedbackAsset.CL);
        const id=crypto.createHash('sha256').update(util.getProjectId()+':'+userId+':'+input.requestId).update(b).digest('hex').slice(0,32);
        const existing=await FeedbackAsset.getOne({_id:id,FEEDBACK_ASSET_OWNER:userId});if(existing)return {fileID:existing.FEEDBACK_ASSET_FILE};
        if(await FeedbackAsset.count({FEEDBACK_ASSET_OWNER:userId,FEEDBACK_ASSET_REQUEST:input.requestId})>=3)this.AppError('每条反馈最多3张图片');
        await contentCheck.checkImgClient(input.base64,png?'png':'jpeg');
        const result=await cloudBase.getCloud().uploadFile({cloudPath:util.getProjectId()+'/feedback/'+input.requestId+'/'+id+(png?'.png':'.jpg'),fileContent:b});
        await FeedbackAsset.insert({_id:id,FEEDBACK_ASSET_OWNER:userId,FEEDBACK_ASSET_REQUEST:input.requestId,FEEDBACK_ASSET_FILE:result.fileID});
        return {fileID:result.fileID};
    }
    validateSubmission(input) {
        const categories = ['游玩体验', '环境设施', '服务建议', '其他反馈'];
        if (!input || !categories.includes(input.category)) this.AppError('请选择反馈类型');
        if (typeof input.content !== 'string' || input.content.trim().length < 5 || input.content.trim().length > 500) this.AppError('请填写5至500字的反馈内容');
        if (typeof input.phone !== 'string' || (input.phone && !/^1[3-9]\d{9}$/.test(input.phone))) this.AppError('请填写正确的手机号码');
        if (typeof input.requestId !== 'string' || !/^[a-zA-Z0-9_-]{16,64}$/.test(input.requestId)) this.AppError('提交标识无效，请重新打开页面');
        const prefix = '/' + util.getProjectId() + '/feedback/' + input.requestId + '/';
        if (!Array.isArray(input.images) || input.images.length > 3 || input.images.some(image => typeof image !== 'string' || image.length > 600 || !image.startsWith('cloud://') || !image.includes(prefix))) this.AppError('图片上传未完成，请重新上传');
        return { ...input, content: input.content.trim() };
    }
    async submit(userId, input) {
        input = this.validateSubmission(input);
        await this.ensureCollection();
        const id = crypto.createHash('sha256').update(util.getProjectId() + ':' + userId + ':' + input.requestId).digest('hex').slice(0, 32);
        const existing = await FeedbackModel.getOne({ _id: id, FEEDBACK_USER_ID: userId });
        if (existing) return { id, status: existing.FEEDBACK_STATUS };
        await contentCheck.checkTextMultiClient({ content: input.content });
        for (const fileID of input.images) {
            if(!await dbUtil.isExistCollection(FeedbackAsset.CL) || !await FeedbackAsset.getOne({FEEDBACK_ASSET_OWNER:userId,FEEDBACK_ASSET_REQUEST:input.requestId,FEEDBACK_ASSET_FILE:fileID}))this.AppError('图片不属于当前反馈，请重新上传');
            const downloaded = await cloudBase.getCloud().downloadFile({ fileID });
            const buffer = downloaded.fileContent;
            if (!Buffer.isBuffer(buffer) || !buffer.length || buffer.length > 5 * 1024 * 1024) this.AppError('图片必须在5MB以内');
            const png = buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
            const jpeg = buffer.length >= 3 && buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255;
            if (!png && !jpeg) this.AppError('仅支持 JPG 或 PNG 图片');
            await contentCheck.checkImgClient(buffer.toString('base64'), png ? 'png' : 'jpeg');
        }
        const data = {
            _id: id, FEEDBACK_USER_ID: userId, FEEDBACK_CATEGORY: input.category,
            FEEDBACK_CONTENT: input.content, FEEDBACK_PHONE: input.phone,
            FEEDBACK_IMAGES: input.images, FEEDBACK_STATUS: 0, FEEDBACK_REPLY: ''
        };
        try { await FeedbackModel.insert(data); }
        catch (err) {
            // A retried/concurrent submission with the same request ID is one feedback.
            const saved = await FeedbackModel.getOne({ _id: id, FEEDBACK_USER_ID: userId });
            if (!saved) throw err;
            return { id, status: saved.FEEDBACK_STATUS };
        }
        return { id, status: 0 };
    }
    async list(userId, page = 1, isAdmin = false, id = '') {
        await this.ensureCollection();
        const where = isAdmin ? {} : { FEEDBACK_USER_ID: userId };
        if (id) where._id = require('./cms_validation.js').id(id);
        const fields = '_id,FEEDBACK_CATEGORY,FEEDBACK_CONTENT,FEEDBACK_IMAGES,FEEDBACK_STATUS,FEEDBACK_REPLY,FEEDBACK_REPLY_TIME,FEEDBACK_PROCESS_TIME,FEEDBACK_ADD_TIME' + (isAdmin ? ',FEEDBACK_PHONE' : '');
        const result = await FeedbackModel.getList(where, fields, { FEEDBACK_ADD_TIME: 'desc' }, page, 10, true, 0);
        const fileList = [...new Set(result.list.reduce((all, item) => all.concat(item.FEEDBACK_IMAGES || []), []))];
        if (fileList.length) {
            // Only sign attachments after owner/admin authorization and project filtering.
            const temporary = await cloudBase.getCloud().getTempFileURL({ fileList: fileList.map(fileID => ({ fileID, maxAge: 900 })) });
            const urls = {};
            for (const file of temporary.fileList || []) {
                if (file.tempFileURL) urls[file.fileID] = file.tempFileURL;
            }
            result.list = result.list.map(item => ({ ...item, FEEDBACK_IMAGE_URLS: (item.FEEDBACK_IMAGES || []).map(fileID => urls[fileID] || '') .filter(Boolean) }));
        }
        return result;
    }
    async adminDetail(id) {
        await this.ensureCollection();
        const row = await FeedbackModel.getOne(require('./cms_validation.js').id(id));
        if (!row) this.AppError('反馈不存在');
        const urls = row.FEEDBACK_IMAGES.length ? await cloudBase.getCloud().getTempFileURL({fileList:row.FEEDBACK_IMAGES.map(fileID=>({fileID,maxAge:900}))}) : {fileList:[]};
        return {...row, FEEDBACK_IMAGE_URLS:(urls.fileList||[]).filter(f=>f.tempFileURL).map(f=>f.tempFileURL)};
    }
    async adminList(input) {
        const v = require('./cms_validation.js');
        await this.ensureCollection();
        const page=v.integer(input.page,'页码',1,10000,1), search=v.text(input.search,'搜索',50);
        const where={};
        if(input.status !== undefined && input.status !== '')where.FEEDBACK_STATUS=v.integer(input.status,'处理状态',0,2,0);
        if(search)where.or=[{FEEDBACK_CONTENT:['like',search]},{FEEDBACK_PHONE:['like',search]}];
        return FeedbackModel.getList(where,'_id,FEEDBACK_CATEGORY,FEEDBACK_CONTENT,FEEDBACK_PHONE,FEEDBACK_STATUS,FEEDBACK_ADD_TIME,FEEDBACK_PROCESS_TIME',{FEEDBACK_ADD_TIME:'desc'},page,20,true,0);
    }
    async process(id,status,adminId) {
        const v=require('./cms_validation.js');status=v.integer(status,'处理状态',0,2,0);
        await this.adminDetail(id);
        await FeedbackModel.edit(id,{FEEDBACK_STATUS:status,FEEDBACK_PROCESS_TIME:Date.now(),FEEDBACK_PROCESS_ADMIN:adminId});return {id,status};
    }
    async reply(id, reply, adminId = '') {
        if (typeof reply !== 'string' || !reply.trim() || reply.trim().length > 500) this.AppError('请填写1至500字的回复');
        await this.ensureCollection();
        if (!await FeedbackModel.getOne(id)) this.AppError('该反馈不存在');
        await FeedbackModel.edit(id, { FEEDBACK_REPLY: reply.trim(), FEEDBACK_STATUS: 1, FEEDBACK_REPLY_TIME: Date.now(), FEEDBACK_PROCESS_TIME: Date.now(), FEEDBACK_PROCESS_ADMIN: adminId });
        return { id, status: 1 };
    }
}
module.exports = FeedbackService;

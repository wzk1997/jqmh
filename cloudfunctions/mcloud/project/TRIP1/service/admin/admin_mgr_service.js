const passwordUtil = require('./admin_password.js');
const crypto = require('crypto');
const v = require('../cms_validation.js');
/**
 * Notes: 管理员管理
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2021-07-11 07:48:00 
 */

const BaseProjectAdminService = require('./base_project_admin_service.js');
const util = require('../../../../framework/utils/util.js');
const dataUtil = require('../../../../framework/utils/data_util.js');
const timeUtil = require('../../../../framework/utils/time_util.js');
const AdminModel = require('../../../../framework/platform/model/admin_model.js');
const LogModel = require('../../../../framework/platform/model/log_model.js');
const md5Lib = require('../../../../framework/lib/md5_lib.js');

class AdminMgrService extends BaseProjectAdminService {

	async getAdminsByName(name, fields = '_id,ADMIN_NAME,ADMIN_DELETED') {
		return await AdminModel.getAll({ ADMIN_NAME: name }, fields, { ADMIN_ADD_TIME: 'asc' }, 100);
	}

	async assertAdminNameAvailable(name, excludeId = '') {
		const admins = await this.getAdminsByName(name);
		if (admins.some(admin => admin._id !== excludeId)) this.AppError('账号已存在');
	}

	//**管理员登录  */
	async adminLogin(name, password) {

		// 判断是否存在
		let where = {
			ADMIN_STATUS: 1,
			ADMIN_NAME: name, ADMIN_DELETED: ['<>',true]
		}
		const matches = await AdminModel.getAll(where, '_id,ADMIN_ID,ADMIN_NAME,ADMIN_DESC,ADMIN_TYPE,ADMIN_LOGIN_TIME,ADMIN_LOGIN_CNT,ADMIN_PASSWORD,ADMIN_PERMISSIONS', { ADMIN_ADD_TIME: 'asc' }, 2);
		if (matches.length > 1) this.AppError('管理员账号数据重复，请联系维护人员处理');
		let admin = matches[0];
		if (!admin || !passwordUtil.verify(password,admin.ADMIN_PASSWORD))
			this.AppError('管理员不存在或者已停用');

		let cnt = admin.ADMIN_LOGIN_CNT;

		// 生成token
		let token = crypto.randomBytes(32).toString('hex');
		let tokenTime = timeUtil.time();
		let data = {
			ADMIN_PASSWORD: passwordUtil.hash(password),
			ADMIN_TOKEN: token,
			ADMIN_TOKEN_TIME: tokenTime,
			ADMIN_LOGIN_TIME: timeUtil.time(),
			ADMIN_LOGIN_CNT: cnt + 1
		}
		await AdminModel.edit(admin._id, data);

		let type = admin.ADMIN_TYPE;
		let last = (!admin.ADMIN_LOGIN_TIME) ? '尚未登录' : timeUtil.timestamp2Time(admin.ADMIN_LOGIN_TIME);

		// 写日志
		this.insertLog('登录了系统', admin, LogModel.TYPE.SYS);

		return {
			token,
			name: admin.ADMIN_NAME,
			type,
			last,
			cnt,
            permissions: admin.ADMIN_PERMISSIONS || {}
		}

	}

	async clearLog() {
		let where = {}
		await LogModel.del(where);
	}

	/** 取得日志分页列表 */
	async getLogList({
		search, // 搜索条件
		sortType, // 搜索菜单
		sortVal, // 搜索菜单
		orderBy, // 排序
		whereEx, //附加查询条件 
		page,
		size,
		oldTotal = 0
	}) {

		orderBy = orderBy || {
			LOG_ADD_TIME: 'desc'
		};
		let fields = '*';
		let where = {};

		if (util.isDefined(search) && search) {
			where.or = [{
				LOG_CONTENT: ['like', search]
			}, {
				LOG_ADMIN_DESC: ['like', search]
			}, {
				LOG_ADMIN_NAME: ['like', search]
			}];

		} else if (sortType && util.isDefined(sortVal)) {
			// 搜索菜单
			switch (sortType) {
				case 'type':
					// 按类型
					where.LOG_TYPE = Number(sortVal);
					break;
			}
		}
		let result = await LogModel.getList(where, fields, orderBy, page, size, true, oldTotal);


		return result;
	}

	/** 获取所有管理员 */
	async getMgrList({
		search, // 搜索条件
		sortType, // 搜索菜单
		sortVal, // 搜索菜单
		orderBy, // 排序
		whereEx, //附加查询条件
		page,
		size,
		isTotal = true,
		oldTotal
	}) {
		orderBy = {
			ADMIN_ADD_TIME: 'desc'
		}
		let fields = 'ADMIN_NAME,ADMIN_STATUS,ADMIN_PHONE,ADMIN_TYPE,ADMIN_LOGIN_CNT,ADMIN_LOGIN_TIME,ADMIN_DESC,ADMIN_EDIT_TIME,ADMIN_EDIT_IP';

		let where = {};
		where.and = {
			ADMIN_DELETED: ['<>',true],
            _pid: this.getProjectId() //复杂的查询在此处标注PID
		};
		if (util.isDefined(search) && search) {
			where.or = [{
				ADMIN_NAME: ['like', search]
			},
			{
				ADMIN_PHONE: ['like', search]
			},
			{
				ADMIN_DESC: ['like', search]
			}
			];
		} else if (sortType && util.isDefined(sortVal)) {
			// 搜索菜单
			switch (sortType) {
				case 'status':
					// 按类型
					where.and.ADMIN_STATUS = Number(sortVal);
					break;
				case 'type':
					// 按类型
					where.and.ADMIN_TYPE = Number(sortVal);
					break;
			}
		}

		return await AdminModel.getList(where, fields, orderBy, page, size, isTotal, oldTotal);
	}

    async delMgr(id,myAdminId){
        if(id===myAdminId)this.AppError('不能删除当前登录管理员');
        const admin=await AdminModel.getOne(v.id(id));if(!admin)this.AppError('管理员不存在');
        if(admin.ADMIN_TYPE===1)this.AppError('不能删除超级管理员');
        await AdminModel.edit(id,{ADMIN_STATUS:0,ADMIN_TOKEN:'',ADMIN_TOKEN_TIME:0,ADMIN_DELETED:true});
    }
    async insertMgr(input){
        const name=v.text(input.name,'账号',30,true),desc=v.text(input.desc,'姓名',30,true),phone=v.phone(input.phone);
        if(!/^[a-zA-Z0-9_-]{5,30}$/.test(name))this.AppError('账号需为5至30位字母、数字或下划线');
        if(typeof input.password!=='string'||input.password.length<6||input.password.length>30)this.AppError('密码长度需为6至30位');
		await this.assertAdminNameAvailable(name);
        return AdminModel.insert({ADMIN_NAME:name,ADMIN_DESC:desc,ADMIN_PHONE:phone,ADMIN_PASSWORD:passwordUtil.hash(input.password),ADMIN_TYPE:0});
    }
    async statusMgr(id,status,myAdminId){
        if(![0,1].includes(status))this.AppError('状态不正确');
        const admin=await AdminModel.getOne(v.id(id));if(!admin||admin.ADMIN_DELETED)this.AppError('管理员不存在');
        if(id===myAdminId||admin.ADMIN_TYPE===1)this.AppError('不能停用当前管理员或超级管理员');
        await AdminModel.edit(id,{ADMIN_STATUS:status,ADMIN_TOKEN:'',ADMIN_TOKEN_TIME:0});
    }

	/** 获取管理员信息 */
	async getMgrDetail(id) {
		let fields = '*';

		let where = {
			_id: id
		}
		let mgr = await AdminModel.getOne(where, fields);
		if (!mgr) return null;

		if (mgr) { delete mgr.ADMIN_PASSWORD; delete mgr.ADMIN_TOKEN; }
        return mgr;
	}

    async editMgr(id,input){
        const admin=await AdminModel.getOne(v.id(id));if(!admin||admin.ADMIN_DELETED)this.AppError('管理员不存在');
        const name=v.text(input.name,'账号',30,true),desc=v.text(input.desc,'姓名',30,true),phone=v.phone(input.phone);
        if(!/^[a-zA-Z0-9_-]{5,30}$/.test(name))this.AppError('账号格式不正确');
		await this.assertAdminNameAvailable(name,id);
        const data={ADMIN_NAME:name,ADMIN_DESC:desc,ADMIN_PHONE:phone};
        if(input.password){if(input.password.length<6||input.password.length>30)this.AppError('密码长度不正确');data.ADMIN_PASSWORD=passwordUtil.hash(input.password);data.ADMIN_TOKEN='';data.ADMIN_TOKEN_TIME=0;}
        await AdminModel.edit(id,data);
    }
    async pwdtMgr(adminId,oldPassword,password){
        const admin=await AdminModel.getOne(adminId);
        if(!admin||!passwordUtil.verify(oldPassword,admin.ADMIN_PASSWORD))this.AppError('旧密码错误');
        if(typeof password!=='string'||password.length<6||password.length>30)this.AppError('密码长度不正确');
        return AdminModel.edit(adminId,{ADMIN_PASSWORD:passwordUtil.hash(password),ADMIN_TOKEN:'',ADMIN_TOKEN_TIME:0});
    }
    async setPermissions(id,permissions,myAdminId){
        const admin=await AdminModel.getOne(v.id(id));if(!admin||admin.ADMIN_DELETED)this.AppError('管理员不存在');
        if(id===myAdminId||admin.ADMIN_TYPE===1)this.AppError('超级管理员权限不能修改');
        const modules=['scenic','news','album','product','merchant','feedback'];
        if(!permissions||typeof permissions!=='object'||Array.isArray(permissions)||Object.keys(permissions).some(k=>!modules.includes(k)))this.AppError('权限配置不正确');
        const clean={};for(const module of modules){const ops=permissions[module]||[];if(!Array.isArray(ops)||ops.some(op=>!['read','write','publish','delete'].includes(op)))this.AppError('权限操作不正确');clean[module]=[...new Set(ops)];}
        await AdminModel.edit(id,{ADMIN_PERMISSIONS:clean,ADMIN_TOKEN:'',ADMIN_TOKEN_TIME:0});
    }

}

module.exports = AdminMgrService;

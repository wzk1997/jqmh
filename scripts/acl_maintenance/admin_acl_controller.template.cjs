// Temporary, super-administrator gated maintenance. Can only tighten client access.
const Base = require('./base_project_admin_controller.js');
const AppError = require('../../../../framework/core/app_error.js');
const config = require('../../../../config/config.js');
const manifest = require('../../../../security/collection-rules-manifest.json');
const window = require('../../../../security/acl-maintenance-window.json');
class AdminAclController extends Base {
    async deny() {
        await this.isSuperAdmin();
        if (Date.now() > window.expiresAt) throw new AppError('权限维护窗口已关闭', 2401);
        const {collection, expectedHash} = this._request;
        if (!manifest.collections.includes(collection) || typeof expectedHash !== 'string' || !/^[a-f0-9]{64}$/.test(expectedHash))
            throw new AppError('需要指定集合及原规则备份校验值', 1301);
        const imported = require('@cloudbase/manager-node');
        const CloudBase = imported.default || imported;
        const api = new CloudBase({envId:config.CLOUD_ID}).commonService();
        const params = {CollectionName:collection, EnvId:config.CLOUD_ID};
        const before = await api.call({Action:'DescribeSafeRule', Param:params});
        if (!before || typeof before.AclTag !== 'string') throw new AppError('无法验证原规则，未执行修改');
        const snapshot = {collection, aclTag:before.AclTag, rule:before.Rule === undefined ? null : before.Rule};
        const actualHash = require('crypto').createHash('sha256').update(JSON.stringify(snapshot)).digest('hex');
        if (actualHash !== expectedHash) throw new AppError('规则已变化，请重新备份后再操作', 1301);
        if (before.AclTag === 'ADMINONLY') return {collection, changed:false, aclTag:'ADMINONLY'};
        await api.call({Action:'ModifyDatabaseACL', Param:{...params, AclTag:'ADMINONLY'}});
        const after = await api.call({Action:'DescribeSafeRule', Param:params});
        if (after.AclTag !== 'ADMINONLY') throw new AppError('修改已提交，尚未读取到生效结果，请检查当前权限');
        await this.logOther('收紧数据库客户端权限 ' + collection);
        return {collection, changed:true, aclTag:after.AclTag};
    }
    async inspect() {
        await this.isSuperAdmin();
        if (Date.now() > window.expiresAt) throw new AppError('权限检查窗口已关闭', 2401);
        const collection = this._request.collection;
        if (!manifest.collections.includes(collection)) throw new AppError('集合不在检查范围内', 1301);
        try {
            const imported = require('@cloudbase/manager-node');
            const CloudBase = imported.default || imported;
            const manager = new CloudBase({envId: config.CLOUD_ID});
            const result = await manager.commonService().call({Action:'DescribeSafeRule', Param:{CollectionName:collection, EnvId:config.CLOUD_ID}});
            if (!result || typeof result.AclTag !== 'string') return {available:false, reasonCode:'INVALID_RULE_RESPONSE'};
            return {available:true, collection, aclTag:result.AclTag, rule:result.Rule === undefined ? null : result.Rule};
        } catch (error) {
            const message = String(error.message || '');
            const reason = /credential|secretId|secretKey/i.test(message) ? 'RUNTIME_CREDENTIAL_PROVIDER_UNAVAILABLE'
                : /unauthorized|permission|not authorized|authfailure/i.test(message) ? 'MANAGEMENT_ROLE_DENIED'
                : String(error.code || error.name || 'MANAGEMENT_API_UNAVAILABLE');
            return {available:false, reasonCode:/^[\w.-]{1,100}$/.test(reason) ? reason : 'MANAGEMENT_API_UNAVAILABLE'};
        }
    }
}
module.exports = AdminAclController;

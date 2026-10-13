const AppError = require('../../../../framework/core/app_error.js');
/**
 * Notes: 后台管理控制模块
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2021-03-15 19:20:00 
 */

const BaseAdminController = require('../../../../framework/platform/controller/base_admin_controller.js');
const BaseProjectService = require('../../service/base_project_service.js');

class BaseProjectAdminController extends BaseAdminController {
    async isAdmin() {
        await super.isAdmin();
        const match = this._route.match(/^admin\/(news|album|product|feedback|setup)_/);
        if (match) {
            const action = this._route.split('_').slice(1).join('_');
            const operation = ['list','detail','search'].includes(action) ? 'read' : action === 'del' ? 'delete' : ['status','vouch'].includes(action) ? 'publish' : 'write';
            this.requirePermission(match[1] === 'setup' ? 'scenic' : match[1], operation);
        }
    }
    requirePermission(module, operation) {
        if (!this._admin) throw new AppError('请先登录管理后台');
        if (this._admin.ADMIN_TYPE === 1) return;
        const permissions = this._admin.ADMIN_PERMISSIONS || {};
        // Existing administrators retain their existing content-management scope.
        if (!Object.keys(permissions).length) return;
        if (!Array.isArray(permissions[module]) || !permissions[module].includes(operation)) throw new AppError('没有此操作权限');
    }
	async initSetup() {
		let service = new BaseProjectService();
		await service.initSetup();
	}

}

module.exports = BaseProjectAdminController;
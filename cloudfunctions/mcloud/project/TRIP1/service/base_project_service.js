const BaseService = require('../../../framework/platform/service/base_service.js');
const util = require('../../../framework/utils/util.js');

class BaseProjectService extends BaseService {
    getProjectId() { return util.getProjectId(); }
	// 表结构由本地 SQLite 初始化脚本显式管理，业务请求不再自动建表或迁移。
	async initSetup() { return; }
}
module.exports = BaseProjectService;

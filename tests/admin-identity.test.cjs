const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const serviceFile = path.join(__dirname, '../cloudfunctions/mcloud/project/TRIP1/service/admin/admin_mgr_service.js');

function loadService(adminModel) {
    const module = { exports: {} };
    class BaseProjectAdminService {
        AppError(message) { throw new Error(message); }
        insertLog() {}
    }
    const mocks = {
        './admin_password.js': { verify: (password, hash) => password === hash, hash: password => `hashed:${password}` },
        '../cms_validation.js': { text: value => value, phone: value => value, id: value => value },
        './base_project_admin_service.js': BaseProjectAdminService,
        '../../../../framework/utils/util.js': {},
        '../../../../framework/utils/data_util.js': {},
        '../../../../framework/utils/time_util.js': { time: () => 123456, timestamp2Time: value => String(value) },
        '../../../../framework/platform/model/admin_model.js': adminModel,
        '../../../../framework/platform/model/log_model.js': { TYPE: { SYS: 1 } },
        '../../../../framework/lib/md5_lib.js': {},
    };
    vm.runInThisContext(`(function(require,module,exports){${fs.readFileSync(serviceFile, 'utf8')}\n})`)(
        name => mocks[name] || require(name), module, module.exports
    );
    return module.exports;
}

test('administrator login rejects duplicate active accounts without updating either record', async () => {
    let editCalls = 0;
    const AdminMgrService = loadService({
        getAll: async () => [{ _id: 'first' }, { _id: 'second' }],
        edit: async () => { editCalls += 1; },
    });
    await assert.rejects(new AdminMgrService().adminLogin('admin', '123456'), /账号数据重复/);
    assert.equal(editCalls, 0);
});

test('administrator login updates the unique record by id instead of the shared account name', async () => {
    const edits = [];
    const AdminMgrService = loadService({
        getAll: async () => [{
            _id: 'admin-record-id', ADMIN_ID: 'admin-id', ADMIN_NAME: 'admin', ADMIN_DESC: '超管',
            ADMIN_TYPE: 1, ADMIN_LOGIN_TIME: 0, ADMIN_LOGIN_CNT: 0, ADMIN_PASSWORD: '123456',
        }],
        edit: async (where, data) => edits.push({ where, data }),
    });
    const result = await new AdminMgrService().adminLogin('admin', '123456');
    assert.equal(result.name, 'admin');
    assert.equal(edits.length, 1);
    assert.equal(edits[0].where, 'admin-record-id');
});

test('creating or renaming an administrator rejects every duplicate account record', async () => {
    const AdminMgrService = loadService({
        getOne: async () => ({ _id: 'another', ADMIN_DELETED: false }),
        getAll: async () => [{ _id: 'existing' }],
    });
    const service = new AdminMgrService();
    await assert.rejects(service.insertMgr({ name: 'admin', desc: '管理员', phone: '', password: '123456' }), /账号已存在/);
    await assert.rejects(service.editMgr('another', { name: 'admin', desc: '管理员', phone: '' }), /账号已存在/);
});

const BaseProjectAdminController = require('./base_project_admin_controller.js');
const FeedbackService = require('../../service/feedback_service.js');
class AdminFeedbackController extends BaseProjectAdminController {
    async list() {
        await this.isAdmin();
        const input = this.validateData({ page: 'must|int|min:1|max:1000' });
        return new FeedbackService().list('', input.page, true);
    }
    async detail() { await this.isAdmin();this.requirePermission('feedback','read');return new FeedbackService().adminDetail(this._request.id); }
    async search() { await this.isAdmin();this.requirePermission('feedback','read');return new FeedbackService().adminList(this._request || {}); }
    async process() { await this.isAdmin();this.requirePermission('feedback','write');const result=await new FeedbackService().process(this._request.id,this._request.status,this._adminId);await this.logOther('处理客户反馈 '+result.id);return result; }
    async reply() {
        await this.isAdmin();
        const input = this.validateData({ id: 'must|id', reply: 'must|string|min:1|max:500' });
        const result = await new FeedbackService().reply(input.id, input.reply, this._adminId);
        await this.logOther('回复客户反馈 '+input.id); return result;
    }
}
module.exports = AdminFeedbackController;

const BaseProjectController = require('./base_project_controller.js');
const FeedbackService = require('../service/feedback_service.js');
class FeedbackController extends BaseProjectController {
    async upload(){return new FeedbackService().upload(this._userId,this._request);}
    async submit() {
        const input = this.validateData({ category: 'must|string|max:20', content: 'must|string|min:5|max:500', phone: 'string|max:11|default=', images: 'array|max:3', requestId: 'must|string|min:16|max:64' });
        return new FeedbackService().submit(this._userId, input);
    }
    async myList() {
        const input = this.validateData({ page: 'must|int|min:1|max:1000', id: 'string|min:1|max:80' });
        return new FeedbackService().list(this._userId, input.page, false, input.id || '');
    }
}
module.exports = FeedbackController;

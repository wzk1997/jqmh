/**
 * Notes: 测试模块控制器
 * Date: 2021-03-15 19:20:00 
 */

const BaseController = require('../../controller/base_project_controller.js');
const fakerLib = require('../../../../framework/lib/faker_lib.js');

const VoteModel = require('../../model/vote_model.js');
const VoteBookingModel = require('../../model/vote_booking_model.js');
const VoteService = require('../../service/vote_service.js');

const EnrollModel = require('../../model/enroll_model.js');
const EnrollBookingModel = require('../../model/enroll_booking_model.js');

const ActivityModel = require('../../model/activity_model.js');
const ActivityBookingModel = require('../../model/activity_booking_model.js');

class TestController extends BaseController {

	async test() {
		console.log('TEST>>>>>>>');

		//this.mockEnrollJoin();
		//this.mockActivityJoin();
		this.mockVoteJoin();

	}

	async mockEnrollJoin() {
		console.log('mockEnrollJoin >>>>>>> Begin....');
		let ENROLL_ID = 'b69f67c062d7d46b0bc4d2985c084775';

		let enroll = await EnrollModel.getOne(ENROLL_ID);
		if (!enroll) return console.error('no enroll');

		let join = {};
		join.ENROLL_BOOKING_ENROLL_ID = ENROLL_ID;
		join.ENROLL_BOOKING_STATUS = 1;

		console.log('>>>>delete');
		let delCnt = await EnrollBookingModel.del({ ENROLL_BOOKING_ENROLL_ID: ENROLL_ID });
		console.log('>>>>delete=' + delCnt);

		for (let k = 1; k <= 10; k++) {
			console.log('>>>>insert >' + k);
			join.ENROLL_BOOKING_USER_ID = fakerLib.getUuid();

			join.ENROLL_BOOKING_LAST_TIME = fakerLib.getAddTimestamp();
			join.ENROLL_BOOKING_ADD_TIME = fakerLib.getAddTimestamp();

			join.ENROLL_BOOKING_FORMS = [
				{ mark: 'name', title: '姓名', type: 'text', val: fakerLib.getName() },
				{ mark: 'phone', title: '手机', type: 'mobile', val: fakerLib.getMobile() }
			];

			await EnrollBookingModel.insert(join);
		}

		console.log('>>>> STAT');
		let cnt = await EnrollBookingModel.count({
			ENROLL_BOOKING_ENROLL_ID: ENROLL_ID
		});

		await EnrollModel.edit(ENROLL_ID, { ENROLL_BOOKING_CNT: cnt, ENROLL_MAX_CNT: cnt + 10 });

		console.log('mockEnrollJoin >>>>>>> END');
	}

	async mockActivityJoin() {
		console.log('mockActivityJoin >>>>>>> Begin....');
		let ACTIVITY_ID = '0a4ec1f962d867481158b94f6441f613';

		let activity = await ActivityModel.getOne(ACTIVITY_ID);
		if (!activity) return console.error('no activity');

		let join = {};
		join.ACTIVITY_BOOKING_ACTIVITY_ID = ACTIVITY_ID;
		join.ACTIVITY_BOOKING_STATUS = 1;

		console.log('>>>>delete');
		let delCnt = await ActivityBookingModel.del({ ACTIVITY_BOOKING_ACTIVITY_ID: ACTIVITY_ID });
		console.log('>>>>delete=' + delCnt);

		for (let k = 1; k <= 10; k++) {
			console.log('>>>>insert >' + k);
			join.ACTIVITY_BOOKING_USER_ID = fakerLib.getUuid();

			join.ACTIVITY_BOOKING_CODE = fakerLib.getStr(15);
			join.ACTIVITY_BOOKING_ADD_TIME = fakerLib.getAddTimestamp();

			join.ACTIVITY_BOOKING_FORMS = [
				{ mark: 'name', title: '姓名', type: 'text', val: fakerLib.getName() },
				{ mark: 'phone', title: '手机', type: 'mobile', val: fakerLib.getMobile() }
			];

			await ActivityBookingModel.insert(join);
		}

		console.log('>>>> STAT');
		let cnt = await ActivityBookingModel.count({
			ACTIVITY_BOOKING_ACTIVITY_ID: ACTIVITY_ID
		});

		await ActivityModel.edit(ACTIVITY_ID, { ACTIVITY_BOOKING_CNT: cnt, ACTIVITY_MAX_CNT: cnt + 10 });

		console.log('mockActivityJoin >>>>>>> END');
	}


	async mockVoteJoin() {
		console.log('mockVoteJoin >>>>>>> Begin....');
		let VOTE_ID = 'b69f67c062c3a2b209da6ef133c9d874';

		let vote = await VoteModel.getOne(VOTE_ID);
		if (!vote) return console.error('no vote');

		let join = {};
		join.VOTE_BOOKING_VOTE_ID = VOTE_ID;

		console.log('>>>>delete');
		let delCnt = await VoteBookingModel.del({ VOTE_BOOKING_VOTE_ID: VOTE_ID });
		console.log('>>>>delete=' + delCnt);


		for (let k = 1; k <= 10; k++) {
			console.log('>>>>insert >' + k);
			join.VOTE_BOOKING_USER_ID = fakerLib.getUuid();
			join.VOTE_BOOKING_ADD_TIME = fakerLib.getAddTimestamp();

			
			join.VOTE_BOOKING_CNT = 1;
			join.VOTE_BOOKING_SELECTED = [k % vote.VOTE_ITEM.length];

			await VoteBookingModel.insert(join);
		}

		console.log('>>>> STAT');
		let service = new VoteService();
		service.statVoteItem(VOTE_ID);

		console.log('mockVoteJoin >>>>>>> END');
	}
}

module.exports = TestController;

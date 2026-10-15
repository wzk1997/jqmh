const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');

const directory=fs.mkdtempSync(path.join(os.tmpdir(),'wetravel-local-api-'));
process.env.WETRAVEL_SQLITE_PATH=path.join(directory,'api.sqlite3');
process.env.WETRAVEL_DEMO_DATA='1';
const api=require('../local/server/app.js');
let adminToken='';

test.after(()=>{api.db.close();fs.rmSync(directory,{recursive:true,force:true});});

test('local API initializes demo content and authenticates the local administrator',()=>{
  assert.equal(api.dispatch({route:'health'}).project,'TRIP1');
  assert.ok(api.dispatch({route:'spot/list',params:{}}).total>=1);
  const login=api.dispatch({route:'admin/login',params:{name:'admin',pwd:'123456'}});
  adminToken=login.token;
  assert.equal(login.type,1);
});

test('CMS draft save and publish feed the matching public module',()=>{
  const saved=api.dispatch({route:'admin/cms_save',token:adminToken,params:{module:'spot',data:{name:'本地测试景点',cateId:'main',cateName:'主要景点',desc:'仅保存在测试 SQLite',images:[],forms:[],order:3}}});
  assert.ok(saved.id);
  assert.throws(()=>api.dispatch({route:'spot/view',params:{id:saved.id}}),/尚未发布/);
  api.dispatch({route:'admin/cms_state',token:adminToken,params:{module:'spot',id:saved.id,state:'published'}});
  assert.equal(api.dispatch({route:'spot/view',params:{id:saved.id}}).SPOT_TITLE,'本地测试景点');
});

test('homepage draft stays private until it is explicitly published',()=>{
  const before=api.dispatch({route:'home/portal'});
  api.dispatch({route:'admin/portal_save',token:adminToken,params:{config:{brandName:'本地预览',slides:[],featured:[]}}});
  assert.equal(api.dispatch({route:'home/portal'}).brandName,before.brandName);
  api.dispatch({route:'admin/portal_publish',token:adminToken});
  assert.equal(api.dispatch({route:'home/portal'}).brandName,'本地预览');
});

test('visitor feedback is isolated by token and can be processed by an administrator',()=>{
  const submitted=api.dispatch({route:'feedback/submit',token:'visitor-a',params:{requestId:'feedback-1',category:'建议',content:'希望增加本地路线',images:[]}});
  assert.equal(api.dispatch({route:'feedback/my_list',token:'visitor-b',params:{}}).total,0);
  api.dispatch({route:'admin/feedback_reply',token:adminToken,params:{id:submitted.id,reply:'已记录'}});
  const mine=api.dispatch({route:'feedback/my_list',token:'visitor-a',params:{}});
  assert.equal(mine.list[0].FEEDBACK_REPLY,'已记录');
  assert.equal(mine.list[0].FEEDBACK_STATUS,1);
});

test('booking writes the normalized reservation, day and slot relationship',()=>{
  const slot=api.db.prepare('SELECT s.mark,d.reservation_id FROM reservation_slots s JOIN reservation_days d ON d.id=s.reservation_day_id LIMIT 1').get();
  const joined=api.dispatch({route:'reservation/join',token:'visitor-booking',params:{reservationId:slot.reservation_id,timeMark:slot.mark,forms:[]}});
  const detail=api.dispatch({route:'reservation/my_join_detail',token:'visitor-booking',params:{joinId:joined.id}});
  assert.equal(detail.BOOKING_STATUS,1);
  const adminList=api.dispatch({route:'admin/reservation_join_list',token:adminToken,params:{reservationId:slot.reservation_id,mark:slot.mark}});
  assert.ok(adminList.list.some(row=>row._id===joined.id));
  api.dispatch({route:'admin/join_checkin',token:adminToken,params:{joinId:joined.id,flag:1}});
  assert.equal(api.dispatch({route:'reservation/my_join_detail',token:'visitor-booking',params:{joinId:joined.id}}).BOOKING_IS_CHECKIN,1);
  api.dispatch({route:'admin/join_checkin',token:adminToken,params:{joinId:joined.id,flag:0}});
  api.dispatch({route:'reservation/my_join_cancel',token:'visitor-booking',params:{joinId:joined.id}});
  assert.equal(api.dispatch({route:'reservation/my_join_detail',token:'visitor-booking',params:{joinId:joined.id}}).BOOKING_STATUS,10);
});

test('reservation administration saves normalized days and slots used by the visitor API',()=>{
  const day='2030-05-20',mark='T20300520LOCALTEST';
  const saved=api.dispatch({route:'admin/reservation_insert',token:adminToken,params:{title:'本地预约管理测试',typeId:'scenic',typeName:'景区预约',order:8,isShowLimit:1,formSet:[{mark:'name',type:'text',title:'姓名'}],daysSet:[{day,dayDesc:'测试日期',times:[{mark,start:'09:00',end:'10:00',isLimit:true,limit:3,status:1}]}]}});
  const detail=api.dispatch({route:'admin/reservation_detail',token:adminToken,params:{id:saved.id}});
  assert.equal(detail.RESERVATION_DAYS_SET[0].times[0].limit,3);
  const publicDays=api.dispatch({route:'reservation/list_by_day',params:{day}});
  assert.equal(publicDays[0].id,saved.id);
  api.dispatch({route:'admin/reservation_status',token:adminToken,params:{reservationId:saved.id,status:10}});
  assert.equal(api.dispatch({route:'admin/reservation_detail',token:adminToken,params:{id:saved.id}}).RESERVATION_STATUS,10);
  api.dispatch({route:'admin/reservation_del',token:adminToken,params:{reservationId:saved.id}});
});

test('registered admin utility pages have working local QR and export endpoints',()=>{
  const pageQr=api.dispatch({route:'admin/setup_qr',token:adminToken,params:{path:'/projects/TRIP1/pages/default/index/default_index'}});
  const checkinQr=api.dispatch({route:'admin/self_checkin_qr',token:adminToken,params:{timeMark:'LOCAL-MARK',page:'/projects/TRIP1/pages/reservation/self/reservation_self'}});
  assert.match(pageQr,/\/media\/system\/page-entry\.svg$/);
  assert.match(checkinQr,/\/media\/system\/checkin-LOCAL-MARK\.svg$/);
  const users=api.dispatch({route:'admin/user_data_export',token:adminToken,params:{}});
  assert.ok(users.total>=1);
  assert.match(api.dispatch({route:'admin/user_data_get',token:adminToken,params:{isDel:0}}).url,/user-data\.csv$/);
  const slot=api.db.prepare('SELECT d.reservation_id,d.day FROM reservation_days d LIMIT 1').get();
  const bookings=api.dispatch({route:'admin/join_data_export',token:adminToken,params:{reservationId:slot.reservation_id,startDay:'2000-01-01',endDay:'2099-12-31',status:''}});
  assert.ok(bookings.total>=0);
  assert.match(api.dispatch({route:'admin/join_data_get',token:adminToken,params:{isDel:0}}).url,/booking-data\.csv$/);
  api.dispatch({route:'admin/user_data_del',token:adminToken,params:{}});
  api.dispatch({route:'admin/join_data_del',token:adminToken,params:{}});
  for(const name of ['page-entry.svg','checkin-LOCAL-MARK.svg']){const file=path.join(__dirname,'../local/uploads/system',name);if(fs.existsSync(file))fs.unlinkSync(file);}
});

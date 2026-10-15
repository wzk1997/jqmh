#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {DatabaseSync}=require('node:sqlite');

const root=path.resolve(__dirname,'..');
const base=process.env.WETRAVEL_LOCAL_API||'http://127.0.0.1:8787';
const runId=`acceptance-${Date.now()}`;
const results=[];
let adminToken='';
let visitorToken=`visitor-${runId}`;
let spotId='';

async function api(route,params={},token=''){
  const response=await fetch(`${base}/api`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({route,params,token,PID:'TRIP1'})});
  assert.equal(response.status,200);
  const body=await response.json();
  if(body.code!==200)throw new Error(`${route}: ${body.code} ${body.msg}`);
  return body.data;
}
async function check(id,name,operation){
  const started=Date.now();
  try{const evidence=await operation();results.push({id,name,status:'通过',durationMs:Date.now()-started,evidence});}
  catch(error){results.push({id,name,status:'失败',durationMs:Date.now()-started,error:error.message});process.exitCode=1;}
}

(async()=>{
  await check('BA-01','健康检查与本地数据库定位',async()=>{const r=await fetch(`${base}/health`).then(v=>v.json());assert.equal(r.code,200);assert.match(r.data.database,/local\/data\/wetravel\.sqlite3$/);return r.data;});
  await check('BA-02','管理员登录及管理首页统计',async()=>{const login=await api('admin/login',{name:'admin',pwd:'123456'});adminToken=login.token;assert.ok(adminToken);const stats=await api('admin/home',{},adminToken);assert.ok(Array.isArray(stats));assert.ok(stats.length>=4);return{admin:login.name,stats};});
  await check('BA-03','景点草稿隔离、发布、游客查询',async()=>{const saved=await api('admin/cms_save',{module:'spot',data:{name:`验收景点-${runId}`,cateId:'main',desc:'本地接口验收数据',images:[],forms:[],order:998}},adminToken);spotId=saved.id;const listBefore=await api('spot/list',{search:`验收景点-${runId}`});assert.equal(listBefore.total,0);await api('admin/cms_state',{module:'spot',id:spotId,state:'published'},adminToken);const detail=await api('spot/view',{id:spotId});assert.equal(detail.SPOT_TITLE,`验收景点-${runId}`);return{id:spotId,title:detail.SPOT_TITLE};});
  await check('BA-04','游客注册、资料读取与收藏闭环',async()=>{const mobile=`19${String(Date.now()).slice(-9)}`;await api('passport/register',{name:'验收游客',mobile,forms:[],status:1},visitorToken);const profile=await api('passport/my_detail',{},visitorToken);assert.equal(profile.USER_NAME,'验收游客');assert.equal((await api('fav/update',{type:'spot',oid:spotId,title:'验收景点',path:'/projects/TRIP1/pages/spot/detail/spot_detail?id='+spotId},visitorToken)).isFav,1);assert.equal((await api('fav/is_fav',{oid:spotId},visitorToken)).isFav,1);assert.equal((await api('fav/del',{oid:spotId},visitorToken)).isFav,0);return{name:profile.USER_NAME,mobile};});
  await check('BA-05','反馈图片上传、提交、管理员回复、游客查看',async()=>{const png=Buffer.from('89504e470d0a1a0a0000000d49484452','hex').toString('base64');const upload=await api('feedback/upload',{requestId:runId,base64:png},visitorToken);assert.match(upload.fileID,/\/media\/feedback\//);const submit=await api('feedback/submit',{requestId:runId,category:'服务建议',content:'这是一条本地端到端验收反馈',images:[upload.fileID]},visitorToken);await api('admin/feedback_reply',{id:submit.id,reply:'验收回复已处理'},adminToken);const mine=await api('feedback/my_list',{page:1},visitorToken);const row=mine.list.find(item=>item._id===submit.id);assert.equal(row.FEEDBACK_STATUS,1);assert.equal(row.FEEDBACK_REPLY,'验收回复已处理');return{id:submit.id,image:upload.fileID,status:row.FEEDBACK_STATUS};});
  await check('BA-06','预约创建、个人详情与取消闭环',async()=>{const db=new DatabaseSync(path.join(root,'local/data/wetravel.sqlite3'),{readOnly:true});const slot=db.prepare('SELECT s.mark,d.reservation_id FROM reservation_slots s JOIN reservation_days d ON d.id=s.reservation_day_id LIMIT 1').get();db.close();assert.ok(slot);const joined=await api('reservation/join',{reservationId:slot.reservation_id,timeMark:slot.mark,forms:[]},visitorToken);let detail=await api('reservation/my_join_detail',{joinId:joined.id},visitorToken);assert.equal(detail.BOOKING_STATUS,1);await api('reservation/my_join_cancel',{joinId:joined.id},visitorToken);detail=await api('reservation/my_join_detail',{joinId:joined.id},visitorToken);assert.equal(detail.BOOKING_STATUS,10);return{id:joined.id,status:detail.BOOKING_STATUS};});
  await check('BA-07','未授权管理接口拦截',async()=>{const body=await fetch(`${base}/api`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({route:'admin/cms_list',params:{module:'spot'},token:'',PID:'TRIP1'})}).then(v=>v.json());assert.equal(body.code,2401);return{code:body.code,msg:body.msg};});
  await check('BA-08','SQLite 完整性与外键检查',async()=>{const db=new DatabaseSync(path.join(root,'local/data/wetravel.sqlite3'),{readOnly:true});const integrity=db.prepare('PRAGMA integrity_check').get().integrity_check;const foreignKeys=db.prepare('PRAGMA foreign_key_check').all();db.close();assert.equal(integrity,'ok');assert.equal(foreignKeys.length,0);return{integrity,foreignKeyViolations:0};});
  await check('BA-09','预约后台新增、日期时段落表、关闭与删除',async()=>{const mark=`T20301231${Date.now()}`,saved=await api('admin/reservation_insert',{title:`后台验收预约-${runId}`,typeId:'scenic',typeName:'景区预约',order:20,isShowLimit:1,formSet:[{mark:'name',type:'text',title:'姓名'}],daysSet:[{day:'2030-12-31',dayDesc:'验收日期',times:[{mark,start:'14:00',end:'15:00',isLimit:true,limit:2,status:1}]}]},adminToken);const detail=await api('admin/reservation_detail',{id:saved.id},adminToken);assert.equal(detail.RESERVATION_DAYS_SET[0].times[0].limit,2);await api('admin/reservation_status',{reservationId:saved.id,status:10},adminToken);assert.equal((await api('admin/reservation_detail',{id:saved.id},adminToken)).RESERVATION_STATUS,10);await api('admin/reservation_del',{reservationId:saved.id},adminToken);return{id:saved.id,day:'2030-12-31',slot:mark,deleted:true};});
  if(spotId&&adminToken){try{await api('admin/cms_remove',{module:'spot',id:spotId},adminToken);}catch{}}
  try{const db=new DatabaseSync(path.join(root,'local/data/wetravel.sqlite3'));db.exec('PRAGMA foreign_keys=ON; BEGIN');const user=db.prepare('SELECT id FROM users WHERE project_id=? AND mini_openid=?').get('TRIP1',visitorToken);if(user){db.prepare('DELETE FROM assets WHERE owner_user_id=?').run(user.id);db.prepare('DELETE FROM bookings WHERE user_id=?').run(user.id);db.prepare('DELETE FROM feedback WHERE user_id=?').run(user.id);db.prepare('DELETE FROM favorites WHERE user_id=?').run(user.id);db.prepare('DELETE FROM users WHERE id=?').run(user.id);fs.rmSync(path.join(root,'local/uploads/feedback',user.id),{recursive:true,force:true});}if(spotId)db.prepare('DELETE FROM spots WHERE id=?').run(spotId);db.exec('COMMIT');db.close();}catch(error){results.push({id:'TEARDOWN',name:'验收数据清理',status:'失败',error:error.message});process.exitCode=1;}
  const report={generatedAt:new Date().toISOString(),base,runId,summary:{total:results.length,passed:results.filter(r=>r.status==='通过').length,failed:results.filter(r=>r.status==='失败').length},results};
  const target=path.join(root,'docs/test-reports/local-business-acceptance.json');fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
})().catch(error=>{console.error(error);process.exitCode=1;});

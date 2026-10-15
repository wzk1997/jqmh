const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {execFileSync, spawnSync} = require('node:child_process');

const root = path.resolve(__dirname, '..');
const schema = path.join(root, 'local/sqlite/schema.sql');
const seed = path.join(root, 'local/sqlite/seed.sql');

function fixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wetravel-sqlite-'));
  const db = path.join(dir, 'test.sqlite3');
  execFileSync('sqlite3', [db], {input: fs.readFileSync(schema)});
  execFileSync('sqlite3', [db], {input: fs.readFileSync(seed)});
  const run = sql => execFileSync('sqlite3', ['-batch', '-noheader', db, sql], {encoding:'utf8'}).trim();
  const fail = sql => spawnSync('sqlite3', ['-batch', db, sql], {encoding:'utf8'});
  return {db, run, fail, close(){fs.rmSync(dir,{recursive:true,force:true});}};
}

test('local SQLite schema contains canonical frontend business tables and no legacy module tables', t => {
  const f=fixture();t.after(()=>f.close());
  const tables=f.run("SELECT name FROM sqlite_schema WHERE type='table' ORDER BY name").split('\n');
  for(const name of ['spots','guides','guide_spots','reservations','reservation_days','reservation_slots','bookings','news','merchant_registry','food_merchants','stay_merchants','travel_merchants','panoramas','feedback'])assert(tables.includes(name),name);
  for(const name of ['product','album','meet','day','join','merchants'])assert(!tables.includes(name),name);
  assert.equal(f.run('PRAGMA integrity_check'),'ok');assert.equal(f.run('PRAGMA foreign_key_check'),'');
});

test('food, stay and travel merchants are physically isolated and registry guarded', t => {
  const f=fixture();t.after(()=>f.close());
  f.run("PRAGMA foreign_keys=ON; INSERT INTO merchant_registry(id,project_id,category) VALUES('food-1','TRIP1','food'),('stay-1','TRIP1','stay'),('travel-1','TRIP1','travel'); INSERT INTO food_merchants(id,project_id,name) VALUES('food-1','TRIP1','餐厅'); INSERT INTO stay_merchants(id,project_id,name) VALUES('stay-1','TRIP1','酒店'); INSERT INTO travel_merchants(id,project_id,name) VALUES('travel-1','TRIP1','客运')");
  assert.equal(f.run("SELECT (SELECT count(*) FROM food_merchants)||(SELECT count(*) FROM stay_merchants)||(SELECT count(*) FROM travel_merchants)"),'111');
  assert.notEqual(f.fail("PRAGMA foreign_keys=ON; INSERT INTO food_merchants(id,project_id,name) VALUES('stay-1','TRIP1','错误混入')").status,0);
  assert.notEqual(f.fail("PRAGMA foreign_keys=ON; UPDATE merchant_registry SET category='stay' WHERE id='food-1'").status,0);
});

test('seed data is frontend-aligned and repeated initialization is idempotent', t => {
  const f=fixture();t.after(()=>f.close());
  execFileSync('sqlite3',[f.db],{input:fs.readFileSync(schema)});execFileSync('sqlite3',[f.db],{input:fs.readFileSync(seed)});
  assert.equal(f.run("SELECT count(*) FROM projects WHERE id='TRIP1'"),'1');
  assert.equal(f.run("SELECT group_concat(module||':'||category_key, ',') FROM (SELECT module,category_key FROM content_categories ORDER BY module,sort_order)"),'guide:route,guide:food,guide:stay,guide:shopping,news:activity,news:announcement,news:tips,spot:main,spot:other');
});

test('JSON, category and cross-project guide relations are enforced by the database', t => {
  const f=fixture();t.after(()=>f.close());
  assert.notEqual(f.fail("PRAGMA foreign_keys=ON; INSERT INTO spots(id,project_id,title,data_json) VALUES('bad-json','TRIP1','错误','{')").status,0);
  assert.notEqual(f.fail("PRAGMA foreign_keys=ON; INSERT INTO spots(id,project_id,category_id,title) VALUES('bad-category','TRIP1','missing','错误')").status,0);
  f.run("PRAGMA foreign_keys=ON; INSERT INTO spots(id,project_id,category_id,title) VALUES('s1','TRIP1','spot-main','观景台'); INSERT INTO guides(id,project_id,category_id,title) VALUES('g1','TRIP1','guide-route','经典路线'); INSERT INTO guide_spots(guide_id,spot_id,position,duration) VALUES('g1','s1',0,'1小时')");
  assert.equal(f.run("SELECT g.title||'>'||s.title||':'||gs.position FROM guide_spots gs JOIN guides g ON g.id=gs.guide_id JOIN spots s ON s.id=gs.spot_id"),'经典路线>观景台:0');
  f.run("PRAGMA foreign_keys=ON; INSERT INTO projects(id,name) VALUES('OTHER','其他项目'); INSERT INTO spots(id,project_id,title) VALUES('s2','OTHER','其他景点')");
  assert.notEqual(f.fail("PRAGMA foreign_keys=ON; INSERT INTO guide_spots(guide_id,spot_id,position) VALUES('g1','s2',1)").status,0);
});

test('booking must match the selected reservation day and slot and duplicate active booking is rejected', t => {
  const f=fixture();t.after(()=>f.close());
  f.run("PRAGMA foreign_keys=ON; INSERT INTO users(id,project_id,mini_openid,mobile) VALUES('u1','TRIP1','openid-1','13800000000'); INSERT INTO reservations(id,project_id,title,type_id,type_name) VALUES('r1','TRIP1','景点预约','spot','景点预约'); INSERT INTO reservation_days(id,project_id,reservation_id,day) VALUES('d1','TRIP1','r1','2026-10-20'); INSERT INTO reservation_slots(id,reservation_day_id,mark,starts_at,ends_at,capacity) VALUES('slot1','d1','morning','09:00','10:00',10)");
  f.run("PRAGMA foreign_keys=ON; INSERT INTO bookings(id,project_id,reservation_id,slot_id,user_id,reservation_title,booking_day,starts_at,ends_at,starts_at_timestamp,verification_code) VALUES('b1','TRIP1','r1','slot1','u1','景点预约','2026-10-20','09:00','10:00',1792467600,'123456789012345')");
  assert.notEqual(f.fail("PRAGMA foreign_keys=ON; INSERT INTO bookings(id,project_id,reservation_id,slot_id,user_id,reservation_title,booking_day,starts_at,ends_at,starts_at_timestamp,verification_code) VALUES('b2','TRIP1','r1','slot1','u1','景点预约','2026-10-20','09:00','10:00',1792467600,'223456789012345')").status,0);
  assert.notEqual(f.fail("PRAGMA foreign_keys=ON; INSERT INTO bookings(id,project_id,reservation_id,slot_id,user_id,reservation_title,booking_day,starts_at,ends_at,starts_at_timestamp,verification_code) VALUES('b3','TRIP1','r1','slot1','u1','景点预约','2026-10-21','09:00','10:00',1792554000,'323456789012345')").status,0);
  f.run("UPDATE bookings SET status=10 WHERE id='b1'; INSERT INTO bookings(id,project_id,reservation_id,slot_id,user_id,reservation_title,booking_day,starts_at,ends_at,starts_at_timestamp,verification_code) VALUES('b4','TRIP1','r1','slot1','u1','景点预约','2026-10-20','09:00','10:00',1792467600,'423456789012345')");
  assert.equal(f.run("SELECT count(*) FROM bookings WHERE user_id='u1'"),'2');
});

test('slot capacity is enforced for active bookings', t => {
  const f=fixture();t.after(()=>f.close());
  f.run("PRAGMA foreign_keys=ON; INSERT INTO users(id,project_id,mini_openid,mobile) VALUES('u1','TRIP1','openid-1','13800000000'),('u2','TRIP1','openid-2','13900000000'); INSERT INTO reservations(id,project_id,title,type_id,type_name) VALUES('r1','TRIP1','停车预约','parking','停车预约'); INSERT INTO reservation_days(id,project_id,reservation_id,day) VALUES('d1','TRIP1','r1','2026-10-20'); INSERT INTO reservation_slots(id,reservation_day_id,mark,starts_at,ends_at,capacity) VALUES('slot1','d1','morning','09:00','10:00',1); INSERT INTO bookings(id,project_id,reservation_id,slot_id,user_id,reservation_title,booking_day,starts_at,ends_at,starts_at_timestamp,verification_code) VALUES('b1','TRIP1','r1','slot1','u1','停车预约','2026-10-20','09:00','10:00',1792467600,'123456789012345')");
  assert.notEqual(f.fail("PRAGMA foreign_keys=ON; INSERT INTO bookings(id,project_id,reservation_id,slot_id,user_id,reservation_title,booking_day,starts_at,ends_at,starts_at_timestamp,verification_code) VALUES('b2','TRIP1','r1','slot1','u2','停车预约','2026-10-20','09:00','10:00',1792467600,'223456789012345')").status,0);
});

test('cloud access fails closed when no explicit cloud environment is configured', () => {
  const source=fs.readFileSync(path.join(root,'cloudfunctions/mcloud/framework/cloud/cloud_base.js'),'utf8');
  assert(source.includes("if (!config.CLOUD_ID)"));
  assert(!source.includes('DYNAMIC_CURRENT_ENV'));
  const routes=fs.readFileSync(path.join(root,'cloudfunctions/mcloud/project/TRIP1/public/route.js'),'utf8');
  assert(!routes.includes('admin/schema_'));
});

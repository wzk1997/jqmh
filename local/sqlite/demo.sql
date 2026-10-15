PRAGMA foreign_keys = ON;

INSERT OR IGNORE INTO scenic (
  id, project_id, name, description, address, hours, phone,
  images_json, content_json, info_json, state, sort_order, published_at
) VALUES (
  'local-scenic', 'TRIP1', 'WeTravel 本地演示景区', '本地 SQLite 演示数据，可在管理后台替换。',
  '本地演示地址', '09:00-17:00', '13800000000',
  '["/projects/TRIP1/images/design/portal-mountains-v3.jpg","/projects/TRIP1/images/design/ar-forest-v3.jpg"]',
  '[{"type":"text","val":"这里展示景区介绍、开放信息和游览提示。"}]',
  '{"visitDuration":"约半天","services":"游客中心、咨询服务","tips":"请按现场提示文明游览","seasons":[]}',
  'published', 1, unixepoch()
);

INSERT OR IGNORE INTO spots (
  id, project_id, category_id, title, category_name, forms_json, data_json,
  cms_state, status, sort_order, featured, published_at
) VALUES
  ('local-spot-1','TRIP1','spot-main','山水观景台','主要景点','[]',
   '{"cover":["/projects/TRIP1/images/design/portal-mountains-v3.jpg"],"gallery":["/projects/TRIP1/images/design/portal-mountains-v3.jpg"],"desc":"适合观景与拍照的本地演示景点。","subtitle":"远眺山水","duration":"约1小时","bestTime":"上午","address":"景区入口北侧","star":5}',
   'published',1,1,1,unixepoch()),
  ('local-spot-2','TRIP1','spot-main','森林步道','主要景点','[]',
   '{"cover":["/projects/TRIP1/images/design/ar-forest-v3.jpg"],"gallery":["/projects/TRIP1/images/design/ar-forest-v3.jpg"],"desc":"林间漫步体验。","subtitle":"绿意相伴","duration":"约1.5小时","bestTime":"下午","address":"景区东侧","star":4}',
   'published',1,2,1,unixepoch());

INSERT OR IGNORE INTO guides (
  id, project_id, category_id, title, category_name, duration, forms_json,
  data_json, cms_state, status, sort_order, featured, published_at
) VALUES (
  'local-guide-1','TRIP1','guide-route','半日经典路线','经典路线','约3小时','[]',
  '{"cover":["/projects/TRIP1/images/home/b3.jpg"],"desc":"从观景台前往森林步道的本地演示路线。","detail":[{"type":"text","val":"路线按景点顺序展示，可在后台调整。"}],"spots":["local-spot-1","local-spot-2"]}',
  'published',1,1,1,unixepoch());

INSERT OR IGNORE INTO guide_spots (guide_id, spot_id, position, duration, note, highlight)
VALUES
  ('local-guide-1','local-spot-1',0,'约1小时','先在观景台停留','山水全景'),
  ('local-guide-1','local-spot-2',1,'约1.5小时','沿步道慢行','森林漫步');

INSERT OR IGNORE INTO news (
  id, project_id, category_id, title, description, category_name,
  pictures_json, content_json, cms_state, status, sort_order, featured, published_at
) VALUES
  ('local-news-1','TRIP1','news-announcement','本地演示公告','当前数据来自本地 SQLite。','景区公告',
   '["/projects/TRIP1/images/home/b1.jpg"]','[{"type":"text","val":"后端已切换为本地开发模式。"}]','published',1,1,1,unixepoch()),
  ('local-news-2','TRIP1','news-tips','文明游览提示','请爱护环境并遵守景区指引。','旅游资讯',
   '["/projects/TRIP1/images/home/b3.jpg"]','[{"type":"text","val":"合理安排行程，注意天气变化。"}]','published',1,2,0,unixepoch());

INSERT OR IGNORE INTO merchant_registry(id, project_id, category) VALUES ('local-merchant-1','TRIP1','food');

INSERT OR IGNORE INTO food_merchants (
  id, project_id, name, description, phone, address, hours,
  images_json, content_json, state, sort_order, published_at
) VALUES (
  'local-merchant-1','TRIP1','游客服务餐厅','本地演示商户','13800000001','游客中心旁','10:00-20:00',
  '["/projects/TRIP1/images/home/1.jpg"]','[{"type":"text","val":"提供简餐和饮品。"}]','published',1,unixepoch()
);

INSERT OR IGNORE INTO panoramas (
  id, project_id, name, description, cover_json, resource_type, resource,
  content_json, state, sort_order, published_at
) VALUES (
  'local-panorama-1','TRIP1','森林全景','本地图片预览',
  '["/projects/TRIP1/images/design/ar-forest-v3.jpg"]','image','/projects/TRIP1/images/design/ar-forest-v3.jpg',
  '[]','published',1,unixepoch()
);

INSERT OR IGNORE INTO reservations (
  id, project_id, title, type_id, type_name, content_json, style_json,
  form_schema_json, status, show_limit, sort_order
) VALUES (
  'local-reservation-1','TRIP1','景点参观预约','spot','景点预约',
  '[{"type":"text","val":"请选择日期和时段完成预约。"}]',
  '{"desc":"本地预约流程演示","pic":"/projects/TRIP1/images/home/b1.jpg"}',
  '[{"type":"text","title":"姓名","must":true},{"type":"mobile","title":"手机","must":true}]',
  1,1,1
);

INSERT OR IGNORE INTO reservation_days (id, project_id, reservation_id, day, description)
VALUES ('local-day-1','TRIP1','local-reservation-1',date('now','localtime','+1 day'),'明日可预约');

INSERT OR IGNORE INTO reservation_slots (id, reservation_day_id, mark, starts_at, ends_at, capacity)
VALUES
  ('local-slot-1','local-day-1',date('now','localtime','+1 day')||'#09:00','09:00','10:00',20),
  ('local-slot-2','local-day-1',date('now','localtime','+1 day')||'#14:00','14:00','15:00',20);

INSERT INTO settings (id, project_id, setting_key, setting_type, value_json)
VALUES (
  'local-home-portal','TRIP1','SETUP_HOME_PORTAL','home_portal',
  json_object('published',json_object(
    'scenicId','local-scenic','brandName','WeTravel',
    'slides',json_array(json_object('image','/projects/TRIP1/images/design/portal-mountains-v3.jpg','title','山水相伴','subtitle','本地 SQLite 内容','enabled',json('true'),'target',json_object('module','spot','id','local-spot-1'))),
    'featured',json_array(json_object('module','guide','id','local-guide-1'),json_object('module','spot','id','local-spot-1'),json_object('module','news','id','local-news-1'))
  ))
)
ON CONFLICT(project_id, setting_key) DO NOTHING;

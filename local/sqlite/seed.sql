PRAGMA foreign_keys = ON;

INSERT INTO projects (id, name)
VALUES ('TRIP1', 'WeTravel')
ON CONFLICT(id) DO UPDATE SET name = excluded.name, updated_at = unixepoch();

INSERT INTO content_categories (id, project_id, module, category_key, name, state, sort_order)
VALUES
  ('news-activity', 'TRIP1', 'news', 'activity', '景区活动', 'published', 10),
  ('news-announcement', 'TRIP1', 'news', 'announcement', '景区公告', 'published', 20),
  ('news-tips', 'TRIP1', 'news', 'tips', '旅游资讯', 'published', 30),
  ('guide-route', 'TRIP1', 'guide', 'route', '经典路线', 'published', 10),
  ('guide-food', 'TRIP1', 'guide', 'food', '吃喝攻略', 'published', 20),
  ('guide-stay', 'TRIP1', 'guide', 'stay', '住宿攻略', 'published', 30),
  ('guide-shopping', 'TRIP1', 'guide', 'shopping', '购物攻略', 'published', 40),
  ('spot-main', 'TRIP1', 'spot', 'main', '主要景点', 'published', 10),
  ('spot-other', 'TRIP1', 'spot', 'other', '其他景点', 'published', 99)
ON CONFLICT(project_id, module, category_key) DO UPDATE SET
  name = excluded.name,
  sort_order = excluded.sort_order,
  state = excluded.state,
  updated_at = unixepoch();

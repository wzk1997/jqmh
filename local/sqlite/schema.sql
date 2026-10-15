PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
) STRICT;

CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  role INTEGER NOT NULL DEFAULT 0 CHECK (role IN (0, 1)),
  status INTEGER NOT NULL DEFAULT 1 CHECK (status IN (0, 1)),
  permissions_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(permissions_json)),
  token TEXT NOT NULL DEFAULT '',
  token_expires_at INTEGER NOT NULL DEFAULT 0,
  login_count INTEGER NOT NULL DEFAULT 0 CHECK (login_count >= 0),
  login_at INTEGER NOT NULL DEFAULT 0,
  deleted INTEGER NOT NULL DEFAULT 0 CHECK (deleted IN (0, 1)),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (project_id, name)
) STRICT;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  mini_openid TEXT NOT NULL,
  status INTEGER NOT NULL DEFAULT 1 CHECK (status IN (0, 1, 8, 9)),
  check_reason TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL DEFAULT '',
  mobile TEXT NOT NULL DEFAULT '',
  forms_json TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(forms_json)),
  profile_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(profile_json)),
  login_count INTEGER NOT NULL DEFAULT 0 CHECK (login_count >= 0),
  login_at INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (project_id, mini_openid)
) STRICT;

CREATE TABLE IF NOT EXISTS content_categories (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  module TEXT NOT NULL CHECK (module IN ('news', 'guide', 'spot')),
  category_key TEXT NOT NULL,
  name TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'draft' CHECK (state IN ('draft', 'published', 'offline', 'deleted')),
  sort_order INTEGER NOT NULL DEFAULT 9999,
  draft_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(draft_json)),
  edit_admin_id TEXT REFERENCES admins(id) ON DELETE SET NULL,
  published_at INTEGER NOT NULL DEFAULT 0,
  deleted INTEGER NOT NULL DEFAULT 0 CHECK (deleted IN (0, 1)),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (project_id, module, category_key)
) STRICT;

CREATE TABLE IF NOT EXISTS scenic (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  hours TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  images_json TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(images_json)),
  content_json TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(content_json)),
  info_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(info_json)),
  draft_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(draft_json)),
  state TEXT NOT NULL DEFAULT 'draft' CHECK (state IN ('draft', 'published', 'offline', 'deleted')),
  sort_order INTEGER NOT NULL DEFAULT 9999,
  is_demo INTEGER NOT NULL DEFAULT 0 CHECK (is_demo IN (0, 1)),
  deleted INTEGER NOT NULL DEFAULT 0 CHECK (deleted IN (0, 1)),
  published_at INTEGER NOT NULL DEFAULT 0,
  edit_admin_id TEXT REFERENCES admins(id) ON DELETE SET NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
) STRICT;

CREATE TABLE IF NOT EXISTS spots (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  category_id TEXT REFERENCES content_categories(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  category_name TEXT NOT NULL DEFAULT '',
  forms_json TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(forms_json)),
  data_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(data_json)),
  draft_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(draft_json)),
  cms_state TEXT NOT NULL DEFAULT 'draft' CHECK (cms_state IN ('draft', 'published', 'offline', 'deleted')),
  status INTEGER NOT NULL DEFAULT 0 CHECK (status IN (0, 1)),
  sort_order INTEGER NOT NULL DEFAULT 9999,
  featured INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
  view_count INTEGER NOT NULL DEFAULT 0 CHECK (view_count >= 0),
  qr_file TEXT NOT NULL DEFAULT '',
  is_demo INTEGER NOT NULL DEFAULT 0 CHECK (is_demo IN (0, 1)),
  revision INTEGER NOT NULL DEFAULT 0 CHECK (revision >= 0),
  deleted INTEGER NOT NULL DEFAULT 0 CHECK (deleted IN (0, 1)),
  published_at INTEGER NOT NULL DEFAULT 0,
  edit_admin_id TEXT REFERENCES admins(id) ON DELETE SET NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
) STRICT;

CREATE TABLE IF NOT EXISTS guides (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  category_id TEXT REFERENCES content_categories(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  category_name TEXT NOT NULL DEFAULT '',
  duration TEXT NOT NULL DEFAULT '',
  forms_json TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(forms_json)),
  data_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(data_json)),
  draft_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(draft_json)),
  cms_state TEXT NOT NULL DEFAULT 'draft' CHECK (cms_state IN ('draft', 'published', 'offline', 'deleted')),
  status INTEGER NOT NULL DEFAULT 0 CHECK (status IN (0, 1)),
  sort_order INTEGER NOT NULL DEFAULT 9999,
  featured INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
  view_count INTEGER NOT NULL DEFAULT 0 CHECK (view_count >= 0),
  qr_file TEXT NOT NULL DEFAULT '',
  is_demo INTEGER NOT NULL DEFAULT 0 CHECK (is_demo IN (0, 1)),
  revision INTEGER NOT NULL DEFAULT 0 CHECK (revision >= 0),
  deleted INTEGER NOT NULL DEFAULT 0 CHECK (deleted IN (0, 1)),
  published_at INTEGER NOT NULL DEFAULT 0,
  edit_admin_id TEXT REFERENCES admins(id) ON DELETE SET NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
) STRICT;

CREATE TABLE IF NOT EXISTS guide_spots (
  guide_id TEXT NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
  spot_id TEXT NOT NULL REFERENCES spots(id) ON DELETE RESTRICT,
  position INTEGER NOT NULL CHECK (position >= 0),
  duration TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  highlight TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (guide_id, spot_id),
  UNIQUE (guide_id, position)
) WITHOUT ROWID, STRICT;

CREATE TABLE IF NOT EXISTS news (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  category_id TEXT REFERENCES content_categories(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category_name TEXT NOT NULL DEFAULT '',
  pictures_json TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(pictures_json)),
  content_json TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(content_json)),
  forms_json TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(forms_json)),
  data_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(data_json)),
  draft_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(draft_json)),
  activity_start TEXT NOT NULL DEFAULT '',
  activity_end TEXT NOT NULL DEFAULT '',
  cms_state TEXT NOT NULL DEFAULT 'draft' CHECK (cms_state IN ('draft', 'published', 'offline', 'deleted')),
  status INTEGER NOT NULL DEFAULT 0 CHECK (status IN (0, 1)),
  sort_order INTEGER NOT NULL DEFAULT 9999,
  featured INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
  view_count INTEGER NOT NULL DEFAULT 0 CHECK (view_count >= 0),
  is_demo INTEGER NOT NULL DEFAULT 0 CHECK (is_demo IN (0, 1)),
  revision INTEGER NOT NULL DEFAULT 0 CHECK (revision >= 0),
  deleted INTEGER NOT NULL DEFAULT 0 CHECK (deleted IN (0, 1)),
  published_at INTEGER NOT NULL DEFAULT 0,
  edit_admin_id TEXT REFERENCES admins(id) ON DELETE SET NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  CHECK (activity_end = '' OR activity_start = '' OR activity_end >= activity_start)
) STRICT;

CREATE TABLE IF NOT EXISTS merchant_registry (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('food', 'stay', 'travel')),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(project_id, id)
) STRICT;

CREATE TABLE IF NOT EXISTS food_merchants (
  id TEXT PRIMARY KEY REFERENCES merchant_registry(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  hours TEXT NOT NULL DEFAULT '',
  images_json TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(images_json)),
  content_json TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(content_json)),
  draft_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(draft_json)),
  state TEXT NOT NULL DEFAULT 'draft' CHECK (state IN ('draft', 'published', 'offline', 'deleted')),
  sort_order INTEGER NOT NULL DEFAULT 9999,
  is_demo INTEGER NOT NULL DEFAULT 0 CHECK (is_demo IN (0, 1)),
  deleted INTEGER NOT NULL DEFAULT 0 CHECK (deleted IN (0, 1)),
  published_at INTEGER NOT NULL DEFAULT 0,
  edit_admin_id TEXT REFERENCES admins(id) ON DELETE SET NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
) STRICT;

CREATE TABLE IF NOT EXISTS stay_merchants (
  id TEXT PRIMARY KEY REFERENCES merchant_registry(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  hours TEXT NOT NULL DEFAULT '',
  images_json TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(images_json)),
  content_json TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(content_json)),
  draft_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(draft_json)),
  state TEXT NOT NULL DEFAULT 'draft' CHECK (state IN ('draft', 'published', 'offline', 'deleted')),
  sort_order INTEGER NOT NULL DEFAULT 9999,
  is_demo INTEGER NOT NULL DEFAULT 0 CHECK (is_demo IN (0, 1)),
  deleted INTEGER NOT NULL DEFAULT 0 CHECK (deleted IN (0, 1)),
  published_at INTEGER NOT NULL DEFAULT 0,
  edit_admin_id TEXT REFERENCES admins(id) ON DELETE SET NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
) STRICT;

CREATE TABLE IF NOT EXISTS travel_merchants (
  id TEXT PRIMARY KEY REFERENCES merchant_registry(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  hours TEXT NOT NULL DEFAULT '',
  images_json TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(images_json)),
  content_json TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(content_json)),
  draft_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(draft_json)),
  state TEXT NOT NULL DEFAULT 'draft' CHECK (state IN ('draft', 'published', 'offline', 'deleted')),
  sort_order INTEGER NOT NULL DEFAULT 9999,
  is_demo INTEGER NOT NULL DEFAULT 0 CHECK (is_demo IN (0, 1)),
  deleted INTEGER NOT NULL DEFAULT 0 CHECK (deleted IN (0, 1)),
  published_at INTEGER NOT NULL DEFAULT 0,
  edit_admin_id TEXT REFERENCES admins(id) ON DELETE SET NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
) STRICT;

CREATE TABLE IF NOT EXISTS panoramas (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  cover_json TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(cover_json)),
  resource_type TEXT NOT NULL CHECK (resource_type IN ('image', 'url', 'provider')),
  resource TEXT NOT NULL DEFAULT '',
  content_json TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(content_json)),
  draft_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(draft_json)),
  state TEXT NOT NULL DEFAULT 'draft' CHECK (state IN ('draft', 'published', 'offline', 'deleted')),
  sort_order INTEGER NOT NULL DEFAULT 9999,
  is_demo INTEGER NOT NULL DEFAULT 0 CHECK (is_demo IN (0, 1)),
  deleted INTEGER NOT NULL DEFAULT 0 CHECK (deleted IN (0, 1)),
  published_at INTEGER NOT NULL DEFAULT 0,
  edit_admin_id TEXT REFERENCES admins(id) ON DELETE SET NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
) STRICT;

CREATE TABLE IF NOT EXISTS reservations (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  admin_id TEXT REFERENCES admins(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  type_id TEXT NOT NULL,
  type_name TEXT NOT NULL,
  content_json TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(content_json)),
  style_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(style_json)),
  form_schema_json TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(form_schema_json)),
  status INTEGER NOT NULL DEFAULT 1 CHECK (status IN (0, 1, 9, 10)),
  show_limit INTEGER NOT NULL DEFAULT 1 CHECK (show_limit IN (0, 1)),
  sort_order INTEGER NOT NULL DEFAULT 9999,
  featured INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
  qr_file TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
) STRICT;

CREATE TABLE IF NOT EXISTS reservation_days (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  reservation_id TEXT NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  day TEXT NOT NULL CHECK (day GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  description TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (reservation_id, day)
) STRICT;

CREATE TABLE IF NOT EXISTS reservation_slots (
  id TEXT PRIMARY KEY,
  reservation_day_id TEXT NOT NULL REFERENCES reservation_days(id) ON DELETE CASCADE,
  mark TEXT NOT NULL,
  starts_at TEXT NOT NULL CHECK (starts_at GLOB '[0-2][0-9]:[0-5][0-9]'),
  ends_at TEXT NOT NULL CHECK (ends_at GLOB '[0-2][0-9]:[0-5][0-9]'),
  capacity INTEGER CHECK (capacity IS NULL OR capacity >= 0),
  status INTEGER NOT NULL DEFAULT 1 CHECK (status IN (0, 1)),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (reservation_day_id, mark),
  CHECK (ends_at > starts_at)
) STRICT;

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  reservation_id TEXT NOT NULL REFERENCES reservations(id) ON DELETE RESTRICT,
  slot_id TEXT NOT NULL REFERENCES reservation_slots(id) ON DELETE RESTRICT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  reservation_title TEXT NOT NULL,
  booking_day TEXT NOT NULL,
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  starts_at_timestamp INTEGER NOT NULL,
  verification_code TEXT NOT NULL,
  forms_json TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(forms_json)),
  status INTEGER NOT NULL DEFAULT 1 CHECK (status IN (1, 10, 99)),
  checked_in INTEGER NOT NULL DEFAULT 0 CHECK (checked_in IN (0, 1)),
  checked_in_at INTEGER NOT NULL DEFAULT 0,
  reason TEXT NOT NULL DEFAULT '',
  is_admin_created INTEGER NOT NULL DEFAULT 0 CHECK (is_admin_created IN (0, 1)),
  edit_admin_id TEXT REFERENCES admins(id) ON DELETE SET NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (project_id, verification_code)
) STRICT;

CREATE TABLE IF NOT EXISTS favorites (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('news', 'guide', 'spot', 'scenic', 'merchant', 'panorama')),
  content_id TEXT NOT NULL,
  title TEXT NOT NULL,
  path TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (user_id, content_type, content_id)
) STRICT;

CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  images_json TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(images_json)),
  status INTEGER NOT NULL DEFAULT 0 CHECK (status IN (0, 1, 2)),
  reply TEXT NOT NULL DEFAULT '',
  reply_at INTEGER NOT NULL DEFAULT 0,
  processed_at INTEGER NOT NULL DEFAULT 0,
  process_admin_id TEXT REFERENCES admins(id) ON DELETE SET NULL,
  request_key TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (project_id, user_id, request_key)
) STRICT;

CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  module TEXT NOT NULL CHECK (module IN ('news', 'guide', 'spot', 'scenic', 'merchant', 'panorama', 'feedback')),
  record_id TEXT NOT NULL,
  owner_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  admin_id TEXT REFERENCES admins(id) ON DELETE SET NULL,
  file_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL CHECK (size_bytes BETWEEN 1 AND 5242880),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (project_id, file_path)
) STRICT;

CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  setting_key TEXT NOT NULL,
  setting_type TEXT NOT NULL DEFAULT '',
  value_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(value_json)),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (project_id, setting_key)
) STRICT;

CREATE TABLE IF NOT EXISTS admin_logs (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  admin_id TEXT REFERENCES admins(id) ON DELETE SET NULL,
  admin_name TEXT NOT NULL,
  admin_description TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL,
  log_type INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
) STRICT;

CREATE INDEX IF NOT EXISTS idx_spots_public ON spots(project_id, cms_state, deleted, sort_order);
CREATE INDEX IF NOT EXISTS idx_guides_public ON guides(project_id, cms_state, deleted, sort_order);
CREATE INDEX IF NOT EXISTS idx_news_public ON news(project_id, cms_state, deleted, sort_order);
CREATE INDEX IF NOT EXISTS idx_food_merchants_public ON food_merchants(project_id, state, deleted, sort_order);
CREATE INDEX IF NOT EXISTS idx_stay_merchants_public ON stay_merchants(project_id, state, deleted, sort_order);
CREATE INDEX IF NOT EXISTS idx_travel_merchants_public ON travel_merchants(project_id, state, deleted, sort_order);
CREATE INDEX IF NOT EXISTS idx_panoramas_public ON panoramas(project_id, state, deleted, sort_order);
CREATE INDEX IF NOT EXISTS idx_reservations_public ON reservations(project_id, status, sort_order);
CREATE INDEX IF NOT EXISTS idx_reservation_days_date ON reservation_days(reservation_id, day);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(project_id, user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_slot_status ON bookings(slot_id, status, checked_in);
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_one_active_per_user
  ON bookings(slot_id, user_id) WHERE status = 1;
CREATE INDEX IF NOT EXISTS idx_feedback_admin ON feedback(project_id, status, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_mobile_nonempty
  ON users(project_id, mobile) WHERE mobile <> '';

CREATE TRIGGER IF NOT EXISTS food_merchant_category_guard
BEFORE INSERT ON food_merchants
BEGIN
  SELECT CASE WHEN NOT EXISTS (SELECT 1 FROM merchant_registry r WHERE r.id=NEW.id AND r.project_id=NEW.project_id AND r.category='food')
    THEN RAISE(ABORT, 'food merchant registry mismatch') END;
END;

CREATE TRIGGER IF NOT EXISTS stay_merchant_category_guard
BEFORE INSERT ON stay_merchants
BEGIN
  SELECT CASE WHEN NOT EXISTS (SELECT 1 FROM merchant_registry r WHERE r.id=NEW.id AND r.project_id=NEW.project_id AND r.category='stay')
    THEN RAISE(ABORT, 'stay merchant registry mismatch') END;
END;

CREATE TRIGGER IF NOT EXISTS travel_merchant_category_guard
BEFORE INSERT ON travel_merchants
BEGIN
  SELECT CASE WHEN NOT EXISTS (SELECT 1 FROM merchant_registry r WHERE r.id=NEW.id AND r.project_id=NEW.project_id AND r.category='travel')
    THEN RAISE(ABORT, 'travel merchant registry mismatch') END;
END;

CREATE TRIGGER IF NOT EXISTS merchant_registry_category_immutable
BEFORE UPDATE OF category ON merchant_registry
WHEN NEW.category <> OLD.category
BEGIN
  SELECT RAISE(ABORT, 'merchant category is immutable');
END;

CREATE TRIGGER IF NOT EXISTS booking_slot_matches_reservation
BEFORE INSERT ON bookings
BEGIN
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1
    FROM reservation_slots rs
    JOIN reservation_days rd ON rd.id = rs.reservation_day_id
    WHERE rs.id = NEW.slot_id
      AND rd.reservation_id = NEW.reservation_id
      AND rd.project_id = NEW.project_id
      AND rd.day = NEW.booking_day
  ) THEN RAISE(ABORT, 'booking slot does not match reservation/day/project') END;
  SELECT CASE WHEN (
    SELECT capacity FROM reservation_slots WHERE id = NEW.slot_id
  ) IS NOT NULL AND (
    SELECT count(*) FROM bookings WHERE slot_id = NEW.slot_id AND status = 1
  ) >= (
    SELECT capacity FROM reservation_slots WHERE id = NEW.slot_id
  ) AND NEW.status = 1 THEN RAISE(ABORT, 'reservation slot is full') END;
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM users WHERE id = NEW.user_id AND project_id = NEW.project_id
  ) THEN RAISE(ABORT, 'booking user does not belong to project') END;
END;

CREATE TRIGGER IF NOT EXISTS guide_spot_same_project
BEFORE INSERT ON guide_spots
BEGIN
  SELECT CASE WHEN (
    SELECT project_id FROM guides WHERE id = NEW.guide_id
  ) <> (
    SELECT project_id FROM spots WHERE id = NEW.spot_id
  ) THEN RAISE(ABORT, 'guide and spot must belong to the same project') END;
END;

# 前后端业务数据模型（本地 SQLite）

当前业务命名统一为景区 `scenic`、景点 `spot`、攻略 `guide`、资讯 `news`、商户 `merchant`、全景 `panorama`、预约项目 `reservation`、预约日期 `reservation_day`、预约时段 `reservation_slot` 和预约记录 `booking`。

本地表结构位于 `local/sqlite/schema.sql`，基础分类位于 `local/sqlite/seed.sql`，联调数据位于 `local/sqlite/demo.sql`。它们只操作传入的本地 SQLite 文件，不连接微信云开发，也没有线上迁移、部署或删表逻辑。

## 表和前端模块对应关系

| 前端业务 | SQLite 表 | 主要关联 |
| --- | --- | --- |
| 景区介绍 | `scenic` | 独立发布内容 |
| 景点导览 | `spots` | `category_id → content_categories.id` |
| 园区攻略 | `guides` | 通过 `guide_spots` 按顺序关联景点 |
| 活动资讯 | `news` | `category_id → content_categories.id` |
| 餐饮 | `food_merchants` | 只保存 `food` 商户，受 `merchant_registry` 约束 |
| 住宿 | `stay_merchants` | 只保存 `stay` 商户，受 `merchant_registry` 约束 |
| 交通 | `travel_merchants` | 只保存 `travel` 商户，受 `merchant_registry` 约束 |
| 全景体验 | `panoramas` | 资源类型限定为图片、URL 或服务商 |
| 预约项目 | `reservations` | 包含表单和展示设置 |
| 日期与时段 | `reservation_days`、`reservation_slots` | 级联属于预约项目 |
| 游客预约 | `bookings` | 关联用户、预约项目和具体时段 |
| 收藏 | `favorites` | 保存标准内容类型和详情页路径 |
| 客户反馈 | `feedback` | 关联用户和处理管理员 |

内容正文、表单、图片列表、草稿等可变结构使用 SQLite JSON 字段，并由 `json_valid` 约束保证内容合法。攻略与景点、预约与时段、预约记录与用户都使用真实外键。项目 ID 存在每张业务表中，用于隔离不同项目。

## 本地初始化

```sh
./scripts/init_local_sqlite.sh
```

默认生成 `local/data/wetravel.sqlite3`，该目录已加入 `.gitignore`。也可以传入其他本地路径：

```sh
./scripts/init_local_sqlite.sh /tmp/wetravel-test.sqlite3
```

脚本可以重复执行；表结构使用 `IF NOT EXISTS`，分类种子使用唯一键更新。它最后会执行 `integrity_check` 和 `foreign_key_check`。

不需要演示数据时可以执行：

```sh
WETRAVEL_DEMO_DATA=0 ./scripts/init_local_sqlite.sh
```

## 本地接口联调

```sh
npm run local:server
```

服务监听 `http://127.0.0.1:8787`，小程序在 `CLOUD_ID` 为空时会通过 `LOCAL_API_BASE` 调用该服务。健康检查为 `GET /health`，业务请求统一发送到 `POST /api`。本地管理端初始账号为 `admin`，密码为 `123456`，只存在于本地 SQLite。

管理端的新 CMS 页面支持景区、景点、攻略、资讯、餐饮、住宿、交通、全景和分类的本地新增、编辑、发布、下架、删除与图片上传；首页配置、游客注册、收藏、反馈和预约也走同一套本地数据。上传图片保存在 `local/uploads/`，不会进入云存储。

## 安全边界

- `cloudfunctions/mcloud/config/config.js` 中 `CLOUD_ID` 保持为空。
- `cloud_base.js` 在 `CLOUD_ID` 为空时直接报错，不会自动选择默认云环境。
- 项目中不提供线上表迁移路由和迁移脚本。
- 本地初始化脚本只接受文件路径并调用系统 `sqlite3`。

## 验证

执行：

```sh
node --test tests/*.test.cjs
```

SQLite 测试会在系统临时目录创建一次性数据库，验证表名、分类、JSON 约束、外键、攻略景点顺序、预约时段一致性、重复预约限制和初始化幂等性。测试结束后删除临时数据库。

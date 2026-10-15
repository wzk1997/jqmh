# WeTravel 实际业务操作验收报告

## 执行说明

2026-10-14 23:09（Asia/Shanghai），通过正在运行的 `http://127.0.0.1:8787` 对本地 SQLite 后端执行真实 HTTP 请求。验收脚本为 `scripts/run_local_business_acceptance.cjs`，运行标识为 `acceptance-1791990548996`。

所有操作均使用本地数据库。验收创建的数据在证据记录完成后自动清理，清理后用户验收记录数和景点验收记录数均为 0，数据库完整性仍为 `ok`。

## 操作结果

| 编号 | 实际业务操作 | 结果 | 关键证据 |
| --- | --- | --- | --- |
| BA-01 | 请求健康检查 | 通过 | 数据库路径指向项目内 `local/data/wetravel.sqlite3`，项目为 TRIP1 |
| BA-02 | 使用 admin/123456 登录并读取管理统计 | 通过 | 获得有效 token，统计返回注册用户、内容、反馈、预约四项 |
| BA-03 | 新建景点草稿、验证游客不可见、发布、读取详情 | 通过 | 发布后读取到标题 `验收景点-acceptance-1791990548996` |
| BA-04 | 注册游客、读取个人资料、收藏景点、查询收藏、取消收藏 | 通过 | 收藏状态按 1 → 1 → 0 变化 |
| BA-05 | 上传反馈图片、提交反馈、管理员回复、游客查看回复 | 通过 | 反馈状态为 1，回复内容可读取 |
| BA-06 | 游客预约、读取个人预约详情、取消预约 | 通过 | booking 状态由 1 变为 10 |
| BA-07 | 无 token 调用管理接口 | 通过 | 返回错误码 2401 和“管理员登录已过期” |
| BA-08 | 检查 SQLite 完整性和外键 | 通过 | `integrity_check=ok`，外键违规 0 |
| BA-09 | 后台新增预约、写入日期时段、读取详情、关闭、删除 | 通过 | 日期 2030-12-31、容量 2 正确落表，关闭状态为 10，最终删除成功 |

## 数据流核对

### 内容发布

```text
管理端 cms_save
  → spots.cms_state = draft
  → 游客查询不可见
  → cms_state 发布为 published
  → spot/view 返回发布字段
```

### 反馈处理

```text
游客 token
  → 图片写入 local/uploads/feedback/<user>/<requestId>
  → feedback 记录绑定 user_id 与 request_key
  → 管理员回复并设置 status=1
  → 原游客读取回复
```

### 预约处理

```text
reservations
  → reservation_days
  → reservation_slots
  → bookings(user_id + reservation_id + slot_id)
  → 取消后 status=10
```

该流程确认前端传入的 `reservationId` 和 `timeMark` 最终落入标准化外键关系，而不是继续写入旧 `meet/day/join` 数据结构。

## 数据清理

验收脚本会删除本轮产生的 booking、feedback、favorite、user、测试景点和上传目录。后台预约用例在确认关闭状态后通过管理接口删除。清理动作只针对带本轮唯一 runId 的本地测试数据。

机器可读原始证据：[local-business-acceptance.json](./local-business-acceptance.json)。

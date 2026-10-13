# ScenicNavBar

全局注册标签：`scenic-nav-bar`。实现位于 `miniprogram/cmpts/public/scenic_nav_bar/`，页面需配置 `navigationStyle: custom`。

| 属性 | 默认值 | 用途 |
| --- | --- | --- |
| mode | page | home：透明森林绿；page：白色内页；immersive：透明白字 |
| title / subtitle | 空 | 标题与品牌副标题 |
| brand | false | 显示 WeTravel 品牌图标及标题 |
| back | true | 返回按钮，失败或无页面栈时回真实首页 Tab |
| search / searchUrl | false / 空 | 搜索按钮；触发 search 事件，明确设置 URL 时进入指定搜索页 |
| actions | [] | 业务按钮：id、icon、label，可选 openType（例如 share）；触发 action 事件由页面处理 |
| rightSlotWidth | 0 | 右侧自定义 slot 所需宽度（px），用于计算避让 |
| overlay | false | false 预留组件高度；true 叠在摄影背景上，页面需要自行给标题与交互内容留白 |
| fixed | true | 固定在屏幕顶端；false 使用绝对定位 |

组件测量状态栏、窗口宽度及真实微信胶囊，仅在胶囊左侧放业务按钮。没有复制胶囊或系统菜单。交互区域以外不接收点击，轮播和页面滚动可以穿过透明区域；所有按钮的点击区域为 44 px。

普通页面示例：

```xml
<scenic-nav-bar title="资讯详情" actions="{{navActions}}"/>
```

摄影首页示例：

```xml
<scenic-nav-bar mode="home" title="WeTravel" brand back="{{false}}" overlay
  search searchUrl="/projects/TRIP1/pages/search/portal/portal_search"/>
```

沉浸页面示例：

```xml
<scenic-nav-bar mode="immersive" title="全景漫游" overlay/>
```

`layout` 事件返回 height、status、rowTop、right、safeBottom、tabInset。`ProjectBiz.initPage` 使用相同的 navigation_ui 几何计算，固定列表可传入 `topOffset="{{uiChrome.height}}"`，从可滚动区域扣除导航高度。所有数据接口、内容加载、分页、收藏与分享仍由原页面或业务组件负责。

## 接入与验证

先在首页、景区简介、景区导览和资讯详情实际验证，随后接入游客主流程：攻略与资讯列表、景点／攻略详情、吃住行、游客服务、常见问题、客户反馈、搜索、收藏／浏览记录、资料页、个人中心，以及 AR／全景。原 scene_nav 实现已替换；后台管理和遗留未使用流程继续保留原导航。

四类试点在开发者工具中检查了透明品牌导航、白色内页导航、沉浸白字导航，验证简介返回、导览无栈回首页和资讯正文位置。导航相关测试覆盖胶囊尺寸、安全区域、异常 API 回退、右侧按钮避让、返回失败兜底及搜索／业务事件；原业务接口契约、反馈与页面行为测试继续通过。相机和第三方服务没有在导航验证中调用，真实云数据未写入。

页面监听 `bind:layout="bindScenicLayout"`，将事件几何写入 uiChrome。窗口尺寸变化时组件重新测量；固定列表和导览可视高度跟随同一几何更新。个人中心右上角设置通过 action 事件调用原 bindSetTap，没有增加或改写设置业务。

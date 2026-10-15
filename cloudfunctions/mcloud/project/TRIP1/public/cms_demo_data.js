module.exports=[
  {
    "key": "product_view",
    "module": "spot",
    "name": "观景台",
    "photo": "hero",
    "data": {
      "name": "观景台",
      "order": 1,
      "cateId": "4",
      "desc": "俯瞰山水全景，欣赏清晨柔和的光影。\n【演示内容】用于页面预览，实际景点资料请在后台替换。",
      "hours": "建议白天游览（演示）",
      "address": "WeTravel 演示景区",
      "duration": "约1.5小时",
      "bestTime": "建议上午（演示）",
      "subtitle": "俯瞰山水全景，欣赏清晨柔和的光影。",
      "other": "【演示贴士】请穿舒适防滑的鞋，注意步道安全，随身携带饮水。"
    }
  },
  {
    "key": "product_forest",
    "module": "spot",
    "name": "原始森林",
    "photo": "forest",
    "data": {
      "name": "原始森林",
      "order": 2,
      "cateId": "4",
      "desc": "沿林间步道慢行，感受绿意与自然。\n【演示内容】用于页面预览，实际景点资料请在后台替换。",
      "hours": "建议白天游览（演示）",
      "address": "WeTravel 演示景区",
      "duration": "约1小时",
      "bestTime": "建议上午（演示）",
      "subtitle": "沿林间步道慢行，感受绿意与自然。",
      "other": "【演示贴士】请穿舒适防滑的鞋，注意步道安全，随身携带饮水。"
    }
  },
  {
    "key": "product_lake",
    "module": "spot",
    "name": "高山湖泊",
    "photo": "lake",
    "data": {
      "name": "高山湖泊",
      "order": 3,
      "cateId": "4",
      "desc": "湖光山色，适合停留休息与拍照。\n【演示内容】用于页面预览，实际景点资料请在后台替换。",
      "hours": "建议白天游览（演示）",
      "address": "WeTravel 演示景区",
      "duration": "约1.5小时",
      "bestTime": "建议上午（演示）",
      "subtitle": "湖光山色，适合停留休息与拍照。",
      "other": "【演示贴士】请穿舒适防滑的鞋，注意步道安全，随身携带饮水。"
    }
  },
  {
    "key": "product_rock",
    "module": "spot",
    "name": "奇峰怪石",
    "photo": "hero",
    "data": {
      "name": "奇峰怪石",
      "order": 4,
      "cateId": "4",
      "desc": "沿观景步道探索山峰与地形之美。\n【演示内容】用于页面预览，实际景点资料请在后台替换。",
      "hours": "建议白天游览（演示）",
      "address": "WeTravel 演示景区",
      "duration": "约1小时",
      "bestTime": "建议上午（演示）",
      "subtitle": "沿观景步道探索山峰与地形之美。",
      "other": "【演示贴士】请穿舒适防滑的鞋，注意步道安全，随身携带饮水。"
    }
  },
  {
    "key": "album_classic",
    "module": "guide",
    "name": "一日游经典路线",
    "photo": "hero",
    "data": {
      "name": "一日游经典路线",
      "order": 5,
      "cateId": "1",
      "desc": "精选必玩景点 · 轻松玩转山水",
      "duration": "约8小时",
      "spots": [
        "wt_demo_product_view",
        "wt_demo_product_forest",
        "wt_demo_product_lake",
        "wt_demo_product_rock"
      ],
      "route": [
        {
          "spotId": "wt_demo_product_view",
          "duration": "约1.5小时",
          "note": "俯瞰山水全景，欣赏清晨柔和的光影。",
          "highlight": "湖光山色"
        },
        {
          "spotId": "wt_demo_product_forest",
          "duration": "约1小时",
          "note": "沿林间步道慢行，感受绿意与自然。",
          "highlight": "自然奇观"
        },
        {
          "spotId": "wt_demo_product_lake",
          "duration": "约1.5小时",
          "note": "湖光山色，适合停留休息与拍照。",
          "highlight": "林间漫步"
        },
        {
          "spotId": "wt_demo_product_rock",
          "duration": "约1小时",
          "note": "沿观景步道探索山峰与地形之美。",
          "highlight": "轻松舒适"
        }
      ],
      "body": "这是一条适合慢游的演示路线，串联景区观景平台、森林步道与湖畔风光。可根据天气、体力和同行成员调整停留时间。\n\n【演示数据】路线、时长及景点均为界面展示样例，请勿据此规划真实行程。"
    }
  },
  {
    "key": "album_family",
    "module": "guide",
    "name": "亲子游推荐",
    "photo": "lake",
    "data": {
      "name": "亲子游推荐",
      "order": 6,
      "cateId": "1",
      "desc": "亲子互动 · 寓教于乐",
      "duration": "约6小时",
      "spots": [
        "wt_demo_product_forest",
        "wt_demo_product_lake",
        "wt_demo_product_view"
      ],
      "route": [
        {
          "spotId": "wt_demo_product_forest",
          "duration": "约1小时",
          "note": "沿林间步道慢行，感受绿意与自然。",
          "highlight": "湖光山色"
        },
        {
          "spotId": "wt_demo_product_lake",
          "duration": "约1.5小时",
          "note": "湖光山色，适合停留休息与拍照。",
          "highlight": "自然奇观"
        },
        {
          "spotId": "wt_demo_product_view",
          "duration": "约1.5小时",
          "note": "俯瞰山水全景，欣赏清晨柔和的光影。",
          "highlight": "林间漫步"
        }
      ],
      "body": "这是一条适合慢游的演示路线，串联景区观景平台、森林步道与湖畔风光。可根据天气、体力和同行成员调整停留时间。\n\n【演示数据】路线、时长及景点均为界面展示样例，请勿据此规划真实行程。"
    }
  },
  {
    "key": "album_deep",
    "module": "guide",
    "name": "深度两日游",
    "photo": "hero",
    "data": {
      "name": "深度两日游",
      "order": 7,
      "cateId": "1",
      "desc": "深度体验自然与人文",
      "duration": "两天一晚",
      "spots": [
        "wt_demo_product_rock",
        "wt_demo_product_view",
        "wt_demo_product_forest",
        "wt_demo_product_lake"
      ],
      "route": [
        {
          "spotId": "wt_demo_product_rock",
          "duration": "约1小时",
          "note": "沿观景步道探索山峰与地形之美。",
          "highlight": "湖光山色"
        },
        {
          "spotId": "wt_demo_product_view",
          "duration": "约1.5小时",
          "note": "俯瞰山水全景，欣赏清晨柔和的光影。",
          "highlight": "自然奇观"
        },
        {
          "spotId": "wt_demo_product_forest",
          "duration": "约1小时",
          "note": "沿林间步道慢行，感受绿意与自然。",
          "highlight": "林间漫步"
        },
        {
          "spotId": "wt_demo_product_lake",
          "duration": "约1.5小时",
          "note": "湖光山色，适合停留休息与拍照。",
          "highlight": "轻松舒适"
        }
      ],
      "body": "这是一条适合慢游的演示路线，串联景区观景平台、森林步道与湖畔风光。可根据天气、体力和同行成员调整停留时间。\n\n【演示数据】路线、时长及景点均为界面展示样例，请勿据此规划真实行程。"
    }
  },
  {
    "key": "album_photo",
    "module": "guide",
    "name": "摄影打卡路线",
    "photo": "lake",
    "data": {
      "name": "摄影打卡路线",
      "order": 8,
      "cateId": "1",
      "desc": "捕捉山水之间的四季之美",
      "duration": "约9小时",
      "spots": [
        "wt_demo_product_view",
        "wt_demo_product_lake",
        "wt_demo_product_rock"
      ],
      "route": [
        {
          "spotId": "wt_demo_product_view",
          "duration": "约1.5小时",
          "note": "俯瞰山水全景，欣赏清晨柔和的光影。",
          "highlight": "湖光山色"
        },
        {
          "spotId": "wt_demo_product_lake",
          "duration": "约1.5小时",
          "note": "湖光山色，适合停留休息与拍照。",
          "highlight": "自然奇观"
        },
        {
          "spotId": "wt_demo_product_rock",
          "duration": "约1小时",
          "note": "沿观景步道探索山峰与地形之美。",
          "highlight": "林间漫步"
        }
      ],
      "body": "这是一条适合慢游的演示路线，串联景区观景平台、森林步道与湖畔风光。可根据天气、体力和同行成员调整停留时间。\n\n【演示数据】路线、时长及景点均为界面展示样例，请勿据此规划真实行程。"
    }
  },
  {
    "key": "news_1",
    "module": "news",
    "name": "秋季摄影活动精彩开启",
    "photo": "hero",
    "data": {
      "name": "秋季摄影活动精彩开启",
      "order": 9,
      "cateId": "activity",
      "desc": "用镜头记录山水之间的美好",
      "body": "用镜头记录山水之间的美好。在 WeTravel，我们期待每一次出发都能成为美好的回忆。\n\n【演示资讯】这是用于 UI 与后台管理验证的内容，不代表真实公告或活动。"
    }
  },
  {
    "key": "news_2",
    "module": "news",
    "name": "秋色渐浓 · 漫步山林",
    "photo": "forest",
    "data": {
      "name": "秋色渐浓 · 漫步山林",
      "order": 10,
      "cateId": "tips",
      "desc": "最美的季节，遇见不一样的风景",
      "body": "最美的季节，遇见不一样的风景。在 WeTravel，我们期待每一次出发都能成为美好的回忆。\n\n【演示资讯】这是用于 UI 与后台管理验证的内容，不代表真实公告或活动。"
    }
  },
  {
    "key": "news_3",
    "module": "news",
    "name": "不可错过的山水观景点",
    "photo": "lake",
    "data": {
      "name": "不可错过的山水观景点",
      "order": 11,
      "cateId": "tips",
      "desc": "放慢脚步，感受自然的辽阔",
      "body": "放慢脚步，感受自然的辽阔。在 WeTravel，我们期待每一次出发都能成为美好的回忆。\n\n【演示资讯】这是用于 UI 与后台管理验证的内容，不代表真实公告或活动。"
    }
  },
  {
    "key": "news_4",
    "module": "news",
    "name": "文明出游 · 保护自然环境",
    "photo": "forest",
    "data": {
      "name": "文明出游 · 保护自然环境",
      "order": 12,
      "cateId": "announcement",
      "desc": "爱护景区环境，留下美好的旅行记忆",
      "body": "爱护景区环境，留下美好的旅行记忆。在 WeTravel，我们期待每一次出发都能成为美好的回忆。\n\n【演示资讯】这是用于 UI 与后台管理验证的内容，不代表真实公告或活动。"
    }
  },
  {
    "key": "news_5",
    "module": "news",
    "name": "清晨云海观赏指南",
    "photo": "hero",
    "data": {
      "name": "清晨云海观赏指南",
      "order": 13,
      "cateId": "tips",
      "desc": "记录清晨山水相逢的美好时刻",
      "body": "记录清晨山水相逢的美好时刻。在 WeTravel，我们期待每一次出发都能成为美好的回忆。\n\n【演示资讯】这是用于 UI 与后台管理验证的内容，不代表真实公告或活动。"
    }
  },
  {
    "key": "news_6",
    "module": "news",
    "name": "沿湖慢行 · 发现更多精彩",
    "photo": "lake",
    "data": {
      "name": "沿湖慢行 · 发现更多精彩",
      "order": 14,
      "cateId": "tips",
      "desc": "沿途停留，分享你的旅行故事",
      "body": "沿途停留，分享你的旅行故事。在 WeTravel，我们期待每一次出发都能成为美好的回忆。\n\n【演示资讯】这是用于 UI 与后台管理验证的内容，不代表真实公告或活动。"
    }
  },
  {
    "key": "merchant_food",
    "module": "merchant",
    "name": "山间茶馆",
    "photo": "lake",
    "data": {
      "name": "山间茶馆",
      "order": 15,
      "category": "food",
      "phone": "000-00000000",
      "address": "WeTravel 演示服务区域",
      "hours": "08:00–18:00（演示）",
      "desc": "【演示商家】展示周边服务资料，非真实经营主体，不提供实际联系方式。",
      "body": "本记录用于展示商家详情、图片和营业信息，可在后台编辑或下架。"
    }
  },
  {
    "key": "merchant_stay",
    "module": "merchant",
    "name": "湖畔民宿",
    "photo": "hero",
    "data": {
      "name": "湖畔民宿",
      "order": 16,
      "category": "stay",
      "phone": "000-00000000",
      "address": "WeTravel 演示服务区域",
      "hours": "08:00–18:00（演示）",
      "desc": "【演示商家】展示周边服务资料，非真实经营主体，不提供实际联系方式。",
      "body": "本记录用于展示商家详情、图片和营业信息，可在后台编辑或下架。"
    }
  },
  {
    "key": "merchant_travel",
    "module": "merchant",
    "name": "景区接驳服务",
    "photo": "forest",
    "data": {
      "name": "景区接驳服务",
      "order": 17,
      "category": "travel",
      "phone": "000-00000000",
      "address": "WeTravel 演示服务区域",
      "hours": "08:00–18:00（演示）",
      "desc": "【演示商家】展示周边服务资料，非真实经营主体，不提供实际联系方式。",
      "body": "本记录用于展示商家详情、图片和营业信息，可在后台编辑或下架。"
    }
  },
  {
    "key": "panorama_1",
    "module": "panorama",
    "name": "山水全景",
    "photo": "hero",
    "data": {
      "name": "山水全景",
      "order": 18,
      "resourceType": "image",
      "desc": "【演示图片场景】用于查看大图，非第三方 VR 或实景导航。",
      "body": "这是已发布的演示图片资源。真实全景链接或第三方场景标识可在后台配置。"
    }
  },
  {
    "key": "panorama_2",
    "module": "panorama",
    "name": "林间漫游",
    "photo": "forest",
    "data": {
      "name": "林间漫游",
      "order": 19,
      "resourceType": "image",
      "desc": "【演示图片场景】用于查看大图，非第三方 VR 或实景导航。",
      "body": "这是已发布的演示图片资源。真实全景链接或第三方场景标识可在后台配置。"
    }
  },
  {
    "key": "panorama_3",
    "module": "panorama",
    "name": "湖畔风光",
    "photo": "lake",
    "data": {
      "name": "湖畔风光",
      "order": 20,
      "resourceType": "image",
      "desc": "【演示图片场景】用于查看大图，非第三方 VR 或实景导航。",
      "body": "这是已发布的演示图片资源。真实全景链接或第三方场景标识可在后台配置。"
    }
  },
  {
    "key": "scenic_main",
    "module": "scenic",
    "name": "WeTravel 山水景区",
    "photo": "hero",
    "data": {
      "name": "WeTravel 山水景区",
      "order": 21,
      "desc": "山水相拥，心归自然。探索自然风光，感受山林与湖泊的宁静。\n【演示景区】名称、设施和内容均为设计验证样例。",
      "address": "WeTravel 演示景区（非实际地址）",
      "hours": "08:00–18:00（演示）",
      "body": "WeTravel 以自然为伴，带你在山水之间发现沿途的风景。森林、云海、湖泊与奇峰，是这组演示内容的四个主题。\n\n本景区免费开放，不提供支付、订单或商业预订功能。\n\n【演示数据】请在后台维护真实景区信息后再用于正式展示。",
      "info": {
        "tagline": "山水相拥 · 心归自然",
        "coverQuote": "在这里，遇见更好的自己",
        "coverDescription": "云海翻涌，山风拂面。每一处风景，都值得你停下脚步。",
        "overviewQuote": "山不见我\n我自去见山",
        "highlightsQuote": "山水之间\n总有一处风景\n触动你的心",
        "galleryQuote": "每一张照片\n都是一段美好的回忆",
        "closingQuote": "旅途不止于目的地\n更在于沿途的风景",
        "highlights": [
          {
            "title": "观景台",
            "desc": "俯瞰山水全景，欣赏清晨柔和的光影。",
            "imageIndex": 1
          },
          {
            "title": "原始森林",
            "desc": "沿林间步道慢行，感受绿意与自然。",
            "imageIndex": 2
          },
          {
            "title": "高山湖泊",
            "desc": "湖光山色，适合停留休息与拍照。",
            "imageIndex": 3
          },
          {
            "title": "奇峰怪石",
            "desc": "沿观景步道探索山峰与地形之美。",
            "imageIndex": 1
          }
        ],
        "reasons": [
          {
            "title": "自然风光",
            "desc": "四季皆景，景色往复",
            "imageIndex": 0
          },
          {
            "title": "生态环境",
            "desc": "森林与湖泊，自在呼吸",
            "imageIndex": 0
          },
          {
            "title": "人文体验",
            "desc": "在沿途发现山水故事",
            "imageIndex": 0
          },
          {
            "title": "休闲体验",
            "desc": "慢行、摄影与亲子同行",
            "imageIndex": 0
          }
        ],
        "nature": [
          {
            "title": "云海奇观",
            "desc": "【演示介绍】山间云海与晨光交织，呈现柔和的山水画面。",
            "imageIndex": 1
          },
          {
            "title": "原始森林",
            "desc": "【演示介绍】穿行林间，听风声与鸟鸣。",
            "imageIndex": 2
          }
        ],
        "culture": [
          {
            "title": "山水故事",
            "desc": "【演示介绍】以文字与图片记录地方文化，真实历史资料可在后台替换。",
            "imageIndex": 3
          }
        ],
        "galleryTags": [
          "云海",
          "森林",
          "湖泊"
        ],
        "selfDrive": "【演示】实际自驾路线请由景区管理员填写。",
        "transit": "【演示】实际公共交通线路请由景区管理员填写。",
        "parking": "【演示】实际停车位置与开放信息请在后台维护。",
        "centerService": "【演示】游客咨询与游览帮助。",
        "toiletService": "【演示】卫生间位置与服务说明。",
        "restService": "【演示】休息区位置与服务说明。",
        "foodService": "【演示】餐饮区域与服务说明。",
        "tips": "1. 爱护环境，不乱扔垃圾。\n2. 请注意天气变化和步道安全。\n3. 演示内容不代表实际景区设施。"
      }
    }
  }
];

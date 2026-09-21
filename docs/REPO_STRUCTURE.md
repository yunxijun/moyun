# 墨韵 — 仓库结构设计（Monorepo）

## 整体结构

```
moyun/
├── docs/                          # 项目文档（当前）
│   ├── PROJECT_PLAN.md
│   ├── PROGRESS.md
│   ├── PROMPTS.md
│   ├── PAGE_DESIGN.md
│   ├── MEDIA_PLAN.md
│   └── REPO_STRUCTURE.md
│
├── packages/                      # 共享包
│   ├── core/                      # 核心业务逻辑（平台无关）
│   │   ├── src/
│   │   │   ├── poem/              # 诗词生成逻辑
│   │   │   │   ├── prompts.ts     # System Prompt 模板
│   │   │   │   ├── types.ts       # 诗词数据类型定义
│   │   │   │   └── validator.ts   # 格律校验
│   │   │   ├── calligraphy/       # 书法渲染逻辑
│   │   │   │   ├── fonts.ts       # 字体管理
│   │   │   │   ├── renderer.ts    # Canvas 渲染引擎
│   │   │   │   ├── layout.ts      # 竖排排版算法
│   │   │   │   └── templates.ts   # 卡片模板
│   │   │   ├── api/               # API 客户端（调后端）
│   │   │   │   ├── client.ts      # HTTP 客户端封装
│   │   │   │   ├── poem.ts        # 诗词 API
│   │   │   │   ├── calligraphy.ts # 书法 API
│   │   │   │   └── user.ts        # 用户 API
│   │   │   └── types/             # 公共类型
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── ui/                        # 共享 UI 组件（Vue3）
│       ├── src/
│       │   ├── PoemCard.vue       # 诗词卡片组件
│       │   ├── CalligraphyCanvas.vue  # 书法 Canvas 组件
│       │   ├── StylePicker.vue    # 书法风格选择器
│       │   └── ThemeSelector.vue  # 主题选择器
│       ├── package.json
│       └── tsconfig.json
│
├── apps/                          # 各端应用
│   ├── uni/                       # uni-app 应用（小程序+H5+App）
│   │   ├── src/
│   │   │   ├── pages/             # 页面
│   │   │   │   ├── index/         # 首页（创作入口）
│   │   │   │   ├── result/        # 诗词结果页
│   │   │   │   ├── card/          # 卡片编辑页
│   │   │   │   ├── discover/      # 发现页
│   │   │   │   ├── mine/          # 我的
│   │   │   │   ├── history/       # 历史记录
│   │   │   │   └── vip/           # 会员
│   │   │   ├── static/            # 静态资源
│   │   │   │   ├── fonts/         # 书法字体文件
│   │   │   │   ├── textures/      # 宣纸纹理图
│   │   │   │   ├── stamps/        # 印章素材
│   │   │   │   └── images/        # 其他图片
│   │   │   ├── store/             # Pinia 状态管理
│   │   │   ├── composables/       # 组合式函数
│   │   │   ├── utils/             # 工具函数
│   │   │   ├── App.vue
│   │   │   ├── main.ts
│   │   │   ├── manifest.json      # uni-app 配置
│   │   │   ├── pages.json         # 页面路由配置
│   │   │   └── uni.scss           # 全局样式
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   ├── web/                       # 官网（Nuxt 3）
│   │   ├── pages/
│   │   │   ├── index.vue          # 落地页
│   │   │   ├── app.vue            # 在线体验入口（嵌入H5版）
│   │   │   ├── blog/              # 博客（SEO 内容）
│   │   │   ├── about.vue          # 关于
│   │   │   └── pricing.vue        # 定价
│   │   ├── content/               # Nuxt Content（Markdown 博客）
│   │   ├── components/
│   │   ├── nuxt.config.ts
│   │   └── package.json
│   │
│   └── desktop/                   # 桌面端（Tauri）
│       ├── src-tauri/             # Tauri Rust 后端
│       │   ├── src/
│       │   │   └── main.rs
│       │   ├── Cargo.toml
│       │   └── tauri.conf.json
│       └── package.json           # 引用 uni H5 构建产物
│
├── server/                        # 统一后端 API
│   ├── api/                       # API 路由
│   │   ├── poem/
│   │   │   ├── generate.ts        # POST /api/poem/generate
│   │   │   └── from-image.ts      # POST /api/poem/from-image
│   │   ├── calligraphy/
│   │   │   └── render.ts          # POST /api/calligraphy/render
│   │   └── user/
│   │       ├── login.ts           # POST /api/user/login
│   │       ├── profile.ts         # GET /api/user/profile
│   │       └── usage.ts           # GET /api/user/usage
│   ├── lib/                       # 服务端共享库
│   │   ├── llm.ts                 # LLM 调用封装（DeepSeek等）
│   │   ├── unicalli.ts            # UniCalli API 客户端
│   │   ├── db.ts                  # 数据库连接
│   │   └── auth.ts                # 鉴权中间件
│   ├── package.json
│   └── tsconfig.json
│
├── media-content/                 # 自媒体素材（本地）
│   ├── templates/                 # 图文模板
│   ├── scripts/                   # 批量生成脚本
│   └── calendar/                  # 内容日历
│
├── package.json                   # Monorepo 根配置
├── pnpm-workspace.yaml            # pnpm workspace 声明
├── tsconfig.base.json             # 共享 TS 配置
└── .gitignore
```

---

## 包依赖关系

```
packages/core    ← 零依赖，纯逻辑
     ↑
packages/ui      ← 依赖 core（业务组件）
     ↑
apps/uni         ← 依赖 core + ui（主应用）
apps/web         ← 依赖 core（官网，部分复用）
apps/desktop     ← 包装 uni 的 H5 构建产物

server/          ← 依赖 core（类型共享）
```

---

## pnpm-workspace.yaml

```yaml
packages:
  - 'packages/*'
  - 'apps/*'
  - 'server'
```

---

## 各端发布目标

| 端 | 源码位置 | 构建命令 | 产物 |
|---|---|---|---|
| 微信小程序 | apps/uni | `pnpm --filter @moyun/uni run build:mp-weixin` | dist/mp-weixin/ |
| 抖音小程序 | apps/uni | `pnpm --filter @moyun/uni run build:mp-toutiao` | dist/mp-toutiao/ |
| 小红书小程序 | apps/uni | `pnpm --filter @moyun/uni run build:mp-xhs` | dist/mp-xhs/ |
| H5 (Web) | apps/uni | `pnpm --filter @moyun/uni run build:h5` | dist/h5/ |
| iOS App | apps/uni | `pnpm --filter @moyun/uni run build:app-plus` | 离线包 → Xcode |
| Android App | apps/uni | `pnpm --filter @moyun/uni run build:app-plus` | 离线包 → Android Studio |
| Windows 桌面 | apps/desktop | `pnpm --filter @moyun/desktop run tauri build` | .msi 安装包 |
| macOS 桌面 | apps/desktop | `pnpm --filter @moyun/desktop run tauri build` | .dmg 安装包 |
| 官网 | apps/web | `pnpm --filter @moyun/web run build` | Vercel 自动部署 |
| 后端 API | server | `pnpm --filter @moyun/server run deploy` | Vercel Functions |

---

## 发布优先级

| 优先级 | 平台 | 时间 | 理由 |
|---|---|---|---|
| 🥇 P0 | **H5 (Web)** | Week 5 | 无审核，立刻可用，配合官网 |
| 🥇 P0 | **微信小程序** | Week 5 | 微信生态传播，社交裂变 |
| 🥈 P1 | **官网** | Week 5 | SEO、品牌、引流 |
| 🥈 P1 | **抖音小程序** | Week 6 | 配合抖音自媒体 |
| 🥉 P2 | **iOS App** | Week 8 | App Store 长尾流量 |
| 🥉 P2 | **Android App** | Week 8 | 各应用商店分发 |
| P3 | **Windows 桌面** | Week 10 | 补充桌面场景 |
| P3 | **macOS 桌面** | Week 10 | 补充桌面场景 |
| P3 | **小红书小程序** | Week 10 | 配合小红书运营 |

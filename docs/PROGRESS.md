# 墨韵（MoYun）— 项目进度追踪

> 本文件记录项目每一步的完成情况，确保断点续做时不遗漏。

---

## 当前状态

📍 **Phase 0: 项目初始化** — 进行中

---

## 进度日志

### 2026-09-21（Day 1）

#### ✅ 已完成
1. **市场调研**
   - 竞品分析：China Brush / 九歌 / AI写诗机器人 / Calligrapher
   - 结论：AI诗词 + AI书法融合产品市场空白
   
2. **技术选型确定**
   - 跨端框架：uni-app (Vue3 + Vite + TS) → 小程序 + H5 + iOS + Android
   - 官网：Nuxt 3（SSR/SSG，SEO 友好）
   - 桌面端：Tauri（包装 H5 产物）
   - 统一后端：Vercel Edge Functions / Hono.js
   - AI诗词：DeepSeek API（多模态，支持图片+文字输入）
   - 书法渲染 MVP：Google Fonts 书法字体 + Canvas
   - 书法渲染 V2：UniCalli（真实书法家风格：王羲之/颜真卿/欧阳询/瘦金体）

3. **书法渲染调研**
   - UniCalli：整列书法生成，多书法家+多书体，基于 FLUX，最佳选择
   - CalliFormer：35 位书法家，结构感知 Transformer
   - zi2zi-chain：GAN 路线，有预训练模型
   - FontDiffuser：One-shot 风格迁移，AAAI 2024

4. **多模态图片作诗调研**
   - DeepSeek-V4 / Kimi-K2.6 / GLM-5.1 均支持图片+文字输入
   - 可直接通过统一后端 API 调用

5. **全端架构设计**
   - Monorepo 结构设计完成（REPO_STRUCTURE.md）
   - 包依赖关系明确：core → ui → apps
   - 统一后端 API 设计完成
   - 发布优先级：H5 + 微信小程序 + 官网 > 抖音小程序 > iOS/Android > 桌面

6. **完整文档体系**
   - PROJECT_PLAN.md — 产品定义、技术架构、变现模型
   - PROGRESS.md — 进度追踪
   - PROMPTS.md — AI 诗词 System Prompt
   - PAGE_DESIGN.md — 页面结构与视觉规范
   - MEDIA_PLAN.md — 自媒体运营计划
   - REPO_STRUCTURE.md — Monorepo 目录结构设计

#### 🔄 进行中
- 准备初始化 Monorepo 项目

#### ⏳ 下一步
- 初始化 pnpm Monorepo 项目
- 搭建 uni-app 骨架
- 搭建后端 API 骨架
- 编写并测试诗词 System Prompt
- 准备书法字体资源

---

## Phase 完成度总览

| Phase | 状态 | 进度 |
|---|---|---|
| Phase 0: 项目初始化 | 🔄 进行中 | ████████░░ 80% |
| Phase 1: AI诗词引擎 | ⏳ 未开始 | ░░░░░░░░░░ 0% |
| Phase 2: 书法渲染 | ⏳ 未开始 | ░░░░░░░░░░ 0% |
| Phase 2.5: 真实书法家 | ⏳ 未开始 | ░░░░░░░░░░ 0% |
| Phase 3: 产品上线 | ⏳ 未开始 | ░░░░░░░░░░ 0% |
| Phase 4: 自媒体启动 | ⏳ 未开始 | ░░░░░░░░░░ 0% |
| Phase 5: 增长迭代 | ⏳ 未开始 | ░░░░░░░░░░ 0% |

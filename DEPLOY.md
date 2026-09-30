# 墨韵 MoYun 部署指南

## 架构

```
用户浏览器 → 前端 H5（静态站点）→ 后端 API（Node.js）→ DeepSeek LLM
```

- **前端**：uni-app H5 构建产物（纯静态文件）
- **后端**：Hono.js API 服务（Node.js 18+）

---

## 方案一：Vercel 部署（推荐）

### 1. 前端部署

```bash
# 在项目根目录
npx vercel --prod
```

Vercel 会自动读取 `vercel.json`：
- 构建命令：`pnpm build:h5`
- 输出目录：`apps/uni/dist/build/h5`
- SPA 路由：所有路径重写到 `index.html`

### 2. 后端 API 部署

```bash
cd server
npx vercel --prod
```

需要在 Vercel 项目设置中配置环境变量：
- `DEEPSEEK_API_KEY` — DeepSeek API 密钥
- `LLM_BASE_URL` — LLM API 地址（默认 `https://api.deepseek.com`）
- `LLM_MODEL` — 模型名（默认 `deepseek-chat`）
- `USE_MOCK` — 设为 `true` 使用本地 mock 数据（调试用）

### 3. 前端环境变量

在 Vercel 前端项目中设置：
- `VITE_API_URL` — 后端 API 地址（如 `https://api-moyun.vercel.app`）

---

## 方案二：手动部署

### 前端（任意静态托管）

```bash
# 构建
pnpm build:h5

# 产物在 apps/uni/dist/build/h5/
# 上传到 Nginx / Cloudflare Pages / Netlify / 腾讯云 COS 等
```

Nginx 配置示例：

```nginx
server {
    listen 80;
    server_name moyun.art;
    root /var/www/moyun/h5;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 后端（Node.js 服务器）

```bash
cd server
pnpm install
pnpm build
PORT=3001 node dist/index.js
```

使用 PM2 守护进程：

```bash
pm2 start dist/index.js --name moyun-api
```

---

## 环境变量汇总

| 变量 | 位置 | 说明 | 默认值 |
|---|---|---|---|
| `VITE_API_URL` | 前端构建时 | 后端 API 地址 | `http://localhost:3001` |
| `DEEPSEEK_API_KEY` | 后端运行时 | DeepSeek API 密钥 | — |
| `LLM_BASE_URL` | 后端运行时 | LLM API 基地址 | `https://api.deepseek.com` |
| `LLM_MODEL` | 后端运行时 | LLM 模型名 | `deepseek-chat` |
| `USE_MOCK` | 后端运行时 | 是否使用 mock 数据 | `false` |
| `PORT` | 后端运行时 | 监听端口 | `3001` |

---

## 域名配置

推荐域名方案：
- `moyun.art` — 前端主站
- `api.moyun.art` — 后端 API

在 DNS 中配置 CNAME 指向对应部署平台即可。

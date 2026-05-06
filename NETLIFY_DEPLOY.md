# Netlify 部署指南

## 方案概述

- **前端**：Netlify CDN 静态托管（无广告、全球加速）
- **后端**：Netlify Functions（Serverless，自动扩缩容）
- **数据库**：PlanetScale Serverless MySQL（免费额度足够）

## 准备工作

### 1. 注册 PlanetScale（免费数据库）

1. 访问 https://planetscale.com 用 GitHub 账号登录
2. 创建数据库（如 `hkex-db`）
3. 进入数据库 → Settings → Password → Generate New Password
4. 获取连接字符串，格式如下：
   ```
   mysql://<username>:<password>@<host>:3306/<database>
   ```
5. 记录这个连接字符串，下一步需要

### 2. 本地同步数据库结构

```bash
cd /mnt/agents/output/app

# 修改 .env 里的 DATABASE_URL 为 PlanetScale 的连接字符串
# 然后执行：
npm run db:push
```

这会创建所有表（users, userAssets, rechargeRecords 等）。

### 3. 初始化数据（可选）

```bash
npx tsx db/seed.ts
```

这会创建默认管理员 `whxj` / `FF888999` 和默认股票数据。

## 部署到 Netlify

### 方法一：Git 部署（推荐）

1. 在 GitHub 创建私有仓库（如 `hkex-trading`）
2. 把项目推送到仓库：
   ```bash
   cd /mnt/agents/output/app
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/你的用户名/hkex-trading.git
   git push -u origin main
   ```
3. 登录 Netlify（https://app.netlify.com）
4. 点击 "Add new site" → "Import an existing project" → 选择 GitHub 仓库
5. 构建配置：
   - Build command: `npm run build`
   - Publish directory: `dist/public`
6. 环境变量设置（Site settings → Environment variables）：
   - `DATABASE_URL` = PlanetScale 连接字符串
   - `APP_ID` = 保持原值或任意值
   - `APP_SECRET` = 保持原值或任意值
7. 点击 Deploy

### 方法二：手动上传

1. 登录 Netlify → 拖拽 `dist/public` 文件夹直接部署前端
2. 但手动上传无法部署后端 Functions，所以推荐用 Git 部署

## 部署后配置

### 设置 API 路径

项目已配置 `netlify.toml`，Netlify 会自动识别：
- `/api/trpc/*` → `netlify/functions/api` Function
- 其他路径 → 前端 SPA 路由

### 验证部署

1. 打开 Netlify 分配的域名（如 `https://xxx.netlify.app`）
2. 访问 `https://xxx.netlify.app/api/trpc/ping` 应返回 `{"ok":true}`
3. 访问前台页面注册账号
4. 访问 `https://xxx.netlify.app/#/admin/login` 用 `whxj` / `FF888999` 登录
5. 后台应能看到注册用户数据

## 域名绑定（可选）

在 Netlify Site settings → Domain management 中添加自定义域名。

## 注意事项

1. **Netlify Functions 免费额度**：每月 125,000 次调用，足够小型应用
2. **PlanetScale 免费额度**：每月 5 亿行读取 + 1000 万行写入
3. **冷启动**：Netlify Functions 首次调用可能有 1-2 秒延迟，后续调用正常
4. **数据持久化**：所有数据存在 PlanetScale，Netlify 只运行代码

## 故障排除

### API 返回 404
检查 Netlify Functions 日志（Site overview → Functions → api），确认 `DATABASE_URL` 已正确设置。

### 数据库连接失败
确认 PlanetScale 连接字符串格式正确，且数据库已运行 `db:push` 创建表。

### 前端调用 API 失败
打开浏览器 DevTools → Network 检查请求 URL 是否为 `/api/trpc/...`，确保 `netlify.toml` 的 redirect 规则生效。

# Dockerfile 编写指南（通用 + NestJS）

本文总结 Dockerfile 的常见写法、推荐流程、常用指令与参数，并给出带注释示例，方便在项目中快速落地。

---

## 1. Dockerfile 一般编写流程

1. 选择基础镜像（`FROM`）  
   - 根据运行时选择：`node:20-alpine`、`python:3.12-slim`、`nginx:alpine` 等。
   - 优先选稳定、小体积、官方镜像。

2. 设置工作目录（`WORKDIR`）  
   - 例如 `/app`，后续 `COPY`、`RUN`、`CMD` 都以该目录为基准。

3. 先复制依赖清单，再安装依赖（`COPY` + `RUN`）  
   - 先 `COPY package*.json ./`，再 `RUN npm ci`，可最大化利用缓存。

4. 复制业务代码（`COPY . .`）  
   - 依赖安装后再复制源码，避免源码改动导致依赖层频繁失效。

5. 执行构建（可选，`RUN npm run build`）  
   - TS/前端项目通常需要构建产物。

6. 暴露端口（`EXPOSE`）  
   - 仅文档性声明，真正映射端口在运行命令里（`-p`）。

7. 定义容器启动命令（`CMD` 或 `ENTRYPOINT`）  
   - 常见：`CMD ["npm", "run", "start:prod"]`。

---

## 2. 常用指令与作用

- `FROM`：指定基础镜像，可多阶段构建。  
- `WORKDIR`：设置工作目录，不建议频繁 `cd`。  
- `COPY`：复制文件（推荐替代 `ADD`，更可控）。  
- `ADD`：支持 URL 和自动解压（功能强，但更容易误用）。  
- `RUN`：构建阶段执行命令（会产生镜像层）。  
- `ENV`：设置环境变量（构建和运行期可见）。  
- `ARG`：构建参数（仅构建期可用）。  
- `EXPOSE`：声明容器监听端口。  
- `USER`：切换运行用户（提升安全性）。  
- `VOLUME`：声明挂载点。  
- `CMD`：默认启动命令（可被 `docker run` 覆盖）。  
- `ENTRYPOINT`：固定入口（常与 `CMD` 配合）。  
- `HEALTHCHECK`：容器健康检查。  
- `LABEL`：维护者、版本、仓库地址等元数据。  

---

## 3. NestJS 单阶段示例（简单直观）

```dockerfile
# 1) 选择基础镜像
FROM node:20-alpine

# 2) 设置工作目录
WORKDIR /app

# 3) 先复制依赖清单，利用缓存
COPY package*.json ./

# 4) 安装依赖（生产建议 npm ci，更稳定可复现）
RUN npm ci

# 5) 复制源码
COPY . .

# 6) 构建 NestJS（TS -> JS）
RUN npm run build

# 7) 声明服务端口（仅说明用途）
EXPOSE 3000

# 8) 容器启动命令
CMD ["npm", "run", "start:prod"]
```

> 你当前项目里的 `.dockerfile` 第 6 行是 `npm cli`，应改为 `npm ci`。

---

## 4. NestJS 多阶段示例（更推荐）

多阶段构建可以显著减小最终镜像体积，并减少不必要文件暴露。

```dockerfile
# syntax=docker/dockerfile:1

############################
# Stage 1: 依赖安装
############################
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

############################
# Stage 2: 构建
############################
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

############################
# Stage 3: 运行时
############################
FROM node:20-alpine AS runner
WORKDIR /app

# 仅保留运行所需内容，减小镜像体积
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist

# 可选：安全加固，切换非 root 用户
USER node

EXPOSE 3000
CMD ["node", "dist/main.js"]
```

---

## 5. 常用属性与进阶技巧

- `--platform`：指定平台架构（如 `linux/amd64`）。  
- `--target`：构建到指定阶段（调试多阶段很有用）。  
- `--build-arg`：传入构建参数（对应 `ARG`）。  
- `--no-cache`：忽略缓存，强制全量构建。  
- `--pull`：总是拉取最新基础镜像。  
- `--secret`（BuildKit）：构建时安全注入密钥。  
- `--mount=type=cache`（BuildKit）：缓存包管理器目录，加速构建。  

### `.dockerignore`（非常重要）

建议至少忽略以下内容，避免构建上下文过大：

```gitignore
node_modules
dist
.git
.env
npm-debug.log
coverage
```

---

## 6. 常用命令行（构建/运行/排错）

### 6.1 构建镜像

```bash
docker build -t nestjs-zero:dev .
```

### 6.2 运行容器

```bash
docker run -d --name nestjs-zero -p 3000:3000 --env-file .env nestjs-zero:dev
```

> 如果容器内应用需要连接宿主机 MySQL（而不是容器内 MySQL），请在 `.env` 中使用：
>
> ```env
> DB_HOST=host.docker.internal
> ```

### 6.3 查看日志

```bash
docker logs -f nestjs-zero
```

### 6.4 进入容器排查

```bash
docker exec -it nestjs-zero sh
```

### 6.5 停止与删除

```bash
docker stop nestjs-zero && docker rm nestjs-zero
```

### 6.6 Docker Compose（推荐本地联调）

```bash
docker compose up -d --build
docker compose logs -f
docker compose down
```

### 6.7 部署速查卡（Docker Hub）

将 `<dockerhub_user>` 替换为你的 Docker Hub 用户名。

```bash
# 1) 本地构建镜像
docker build -t nestjs-zero:dev .

# 2) 打发布标签
docker tag nestjs-zero:dev <dockerhub_user>/nestjs-zero:v0.1.0
docker tag nestjs-zero:dev <dockerhub_user>/nestjs-zero:latest

# 3) 推送镜像
docker push <dockerhub_user>/nestjs-zero:v0.1.0
docker push <dockerhub_user>/nestjs-zero:latest

# 4) 服务器部署（首次/重建）
docker pull <dockerhub_user>/nestjs-zero:v0.1.0
docker rm -f nestjs-zero || true
docker run -d --name nestjs-zero --restart unless-stopped -p 3000:3000 --env-file .env <dockerhub_user>/nestjs-zero:v0.1.0

# 5) 运行状态检查
docker ps
docker logs -f nestjs-zero
```

#### 更新发布（示例：v0.1.1）

```bash
docker build -t nestjs-zero:dev .
docker tag nestjs-zero:dev <dockerhub_user>/nestjs-zero:v0.1.1
docker push <dockerhub_user>/nestjs-zero:v0.1.1
docker pull <dockerhub_user>/nestjs-zero:v0.1.1
docker rm -f nestjs-zero
docker run -d --name nestjs-zero --restart unless-stopped -p 3000:3000 --env-file .env <dockerhub_user>/nestjs-zero:v0.1.1
```

#### 回滚（示例：回到 v0.1.0）

```bash
docker rm -f nestjs-zero
docker run -d --name nestjs-zero --restart unless-stopped -p 3000:3000 --env-file .env <dockerhub_user>/nestjs-zero:v0.1.0
```

---

## 7. 常见坑位检查清单

- 依赖安装命令写错：`npm ci` 误写成 `npm cli`。  
- `COPY . .` 过早导致缓存失效、构建变慢。  
- 未配置 `.dockerignore`，上下文巨大。  
- 运行镜像仍包含开发依赖，体积过大。  
- 使用 root 用户运行，存在安全风险。  
- 把密钥硬编码进 Dockerfile（应使用 `--secret`/环境注入）。  
- Docker Daemon 未启动导致 `failed to connect to /var/run/docker.sock`。  
- 容器连接数据库失败（`ECONNREFUSED`）时，优先检查 `DB_HOST` 与目标数据库是否可达。  
- 使用固定容器名重复运行时，报 `container name is already in use`，需先 `docker rm -f <name>`。  

---

## 8. 一句话建议

开发期可用单阶段快速迭代，生产环境优先使用多阶段构建 + 非 root 用户 + 最小化运行时依赖。

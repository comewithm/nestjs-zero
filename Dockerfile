# # 1) 选择基础镜像
# FROM node:20-alpine

# # 2) 设置工作目录
# WORKDIR /app

# # 3) 先复制依赖清单，利用缓存
# COPY package*.json ./

# # 4) 安装依赖（生产建议 npm ci，更稳定可复现）
# RUN npm ci

# # 5) 复制源码
# COPY . .

# # 6) 构建 NestJS（TS -> JS）
# RUN npm run build

# # 7) 声明服务端口（仅说明用途）
# EXPOSE 3000

# # 8) 容器启动命令
# CMD ["npm", "run", "start:prod"]


# 多阶段构建
# ---- deps ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ---- build ----
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- prod ----
FROM node:20-alpine AS prod
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
# 不安装 devDependencies，只装生产依赖
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]

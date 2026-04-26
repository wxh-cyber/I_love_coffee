# i_love_coffee

一个基于 NestJS 构建的咖啡管理 API 示例项目，当前集成了 TypeORM、PostgreSQL、DTO 参数校验以及 Jest 测试能力，适合作为 NestJS 后端开发练习和模块化设计参考。

![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![TypeORM](https://img.shields.io/badge/TypeORM-0.3-FE6D73)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-Test-C21325?logo=jest&logoColor=white)
![License](https://img.shields.io/badge/License-UNLICENSED-lightgrey)

## 技术栈

- 服务端框架：NestJS 10
- 开发语言：TypeScript 5
- ORM：TypeORM 0.3
- 数据库：PostgreSQL
- 数据校验：class-validator、class-transformer
- 测试工具：Jest、Supertest

## 项目结构

```text
i_love_coffee/
├─ src/
│  ├─ main.ts
│  ├─ app.module.ts
│  ├─ app.controller.ts
│  ├─ app.service.ts
│  └─ coffees/
│     ├─ coffees.module.ts
│     ├─ coffees.controller.ts
│     ├─ coffees.service.ts
│     ├─ dto/
│     │  ├─ create-coffee.dto/
│     │  └─ update-coffee.dto/
│     └─ entities/
│        ├─ coffees.entity.ts
│        └─ flavor.entity.ts
├─ test/
│  ├─ app.e2e-spec.ts
│  └─ jest-e2e.json
├─ docker-compose.yaml
└─ package.json
```

### 主要模块说明

- `src/main.ts`：应用入口，注册全局 `ValidationPipe`，监听 `3000` 端口。
- `src/app.module.ts`：根模块，加载 `CoffeesModule` 并通过 `TypeOrmModule.forRoot(...)` 建立数据库连接。
- `src/coffees/`：咖啡业务模块，包含控制器、服务、DTO 和实体定义。
- `src/coffees/dto/`：创建与更新咖啡的请求参数对象。
- `src/coffees/entities/`：`Coffee` 与 `Flavor` 实体定义。
- `test/`：e2e 测试配置与示例测试用例。
- `docker-compose.yaml`：本地 PostgreSQL 容器启动配置。

## 启动方式

### 1. 安装依赖

```bash
npm install
```

### 2. 启动 PostgreSQL

项目根目录已提供 `docker-compose.yaml`，可直接启动本地数据库容器：

```bash
docker compose up -d
```

如果本机使用旧版 Docker Compose，也可以执行：

```bash
docker-compose up -d
```

### 3. 当前数据库连接配置

当前代码中的数据库配置位于 `src/app.module.ts`，连接参数如下：

```text
host: localhost
port: 5432
username: postgres
password: pass123
database: postgres
```

### 4. 启动项目

开发模式：

```bash
npm run start:dev
```

普通启动：

```bash
npm run start
```

生产模式：

```bash
npm run build
npm run start:prod
```

应用默认监听地址：

```text
http://localhost:3000
```

## 测试命令

单元测试：

```bash
npm run test
```

端到端测试：

```bash
npm run test:e2e
```

测试覆盖率：

```bash
npm run test:cov
```

## 当前能力概览

目前项目已包含以下基础能力：

- 基于 NestJS 的模块化后端结构
- `coffees` 资源的控制器与服务层拆分
- 基于 DTO 的请求参数校验与转换
- 基于 TypeORM 的实体映射与数据库读写
- 基础单元测试与 e2e 测试脚手架

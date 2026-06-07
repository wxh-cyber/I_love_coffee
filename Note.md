## 笔记

<hr />

## 在Nest中，有哪些常见的``cli``命令？

在NestJS项目中，CLI（命令行界面）是提高开发效率的利器。它可以帮助我们快速创建项目、生成各种样板代码（模块、控制器、服务等），以及运行和构建项目。

<br />

### 1.基础与项目初始化
**创建新项目**
```bash
nest new project-name
```
**说明**：创建一个全新的``NestJS``项目，会让你选择包管理器（``npm``、``yarn``、``pnpm``等）。如果不想全局安装 ``@nestjs/cli``，可以使用 ``npx @nestjs/cli new project-name``。

<br />

### 2.开发与运行
**启动开发模式（热重载）**
```bash
nest start --watch
```
**说明**：最常用的开发命令，文件修改后会自动重新编译并重启服务。

<br />

**启动开发模式（增量编译）**
```bash
nest start --debug
```
**说明**：启动时保留调试信息，常配合IDE的调试工具使用。

<br />

**启动生产模式**
```bash
nest start --prod
```
**说明**：直接运行编译后的 ``dist`` 目录下的代码，不监听文件变化。

<hr />

### 3.构建项目
**编译项目**
```bash
nest build
```
 **说明**：将TypeScript代码编译为JavaScript，默认输出到 ``dist`` 目录。可以加 ``--watch`` 进行增量编译。

<hr />

### 4.代码生成（核心功能）
这是NestJS CLI最强大的地方，可以通过 ``nest generate <schematic> <name>``（简写为 ``nest g <schematic> <name>``）快速生成各种组件。

<br />

**生成模块**
```bash
nest g module users
# 简写：nest g mo users
```

<br />

**生成控制器**
```bash
nest g controller users
# 简写：nest g co users
```

<br />

**生成服务**
```bash
nest g service users
# 简写：nest g s users
```

<br />

**一键生成完整模块（推荐🌟）**
```bash
nest g resource users
# 简写：nest g res users
```
 **说明**：**极其常用！它会一次性生成该资源的 ``Module``, ``Controller``, ``Service``, ``DTO``, ``Entity``**，并在模块中自动注册。你可以选择生成 REST API 或 GraphQL 模式。

<br />

**生成中间件**
```bash
nest g middleware logger
# 简写：nest g mi logger
```

<br />

**生成守卫**
```bash
nest g guard auth
# 简写：nest g gu auth
```

<br />

**生成拦截器**
```bash
nest g interceptor transform
# 简写：nest g in transform
```

<br />

**生成管道**
```bash
nest g pipe validation
# 简写：nest g pi validation
```

<br />

**生成过滤器**
```bash
nest g filter http-exception
# 简写：nest g f http-exception
```

<br />

**生成类/接口**
```bash
nest g class dto/create-user
# 简写：nest g cl dto/create-user
```

<hr />

### 5.常用生成参数（Flags）
在使用 ``nest g`` 命令时，可以附加一些参数来控制生成行为：
- ``--no-spec``：不生成测试文件（``.spec.ts``）。在快速开发时非常实用
```bash
 nest g service users --no-spec
```
- ``--flat``：不创建对应的文件夹，直接将文件生成在当前目录下。
```bash
 nest g class user.dto --flat
```
- ``-d`` 或 ``--dry-run``：空运行/模拟运行。只会打印将要生成的文件列表，不会实际创建文件（用于提前确认生成路径是否正确）。
```bash
nest g resource users -d
```
- ``--module`` 或 ``-m``：指定将新生成的组件注册到哪个模块（默认会自动查找并注册到最近的模块）。

<hr />

### 6.其他实用命令
**查看项目环境信息**
```bash
nest info
```
**说明**：输出当前系统的 Node 版本、NPM/Yarn 版本、NestJS 核心包版本等，排查环境问题时非常有用。

<br />

**安装官方库**
```bash
nest add @nestjs/swagger
```
**说明**：不仅会 ``npm install`` 该包，还会自动执行该包提供的安装脚本（例如自动修改 ``main.ts`` 添加初始化代码）。

<br />

**更新NestJS核心依赖**
```bash
nest update
# 简写：nest u
```
**说明**：一键将 ``@nestjs/core``, ``@nestjs/common`` 等核心包更新到最新兼容版本。

<hr />

### 总结速查表
| **原词** | **简写** | **用途** |
| :--- | :--- | :--- |
| ``generate`` | ``g`` | 生成文件 |
| ``module`` | ``mo`` | 模块 |
| ``controller`` | ``co`` | 控制器 |
| ``service`` | ``s`` | 服务 |
| ``resource`` | ``res`` | 完整资源（CRUD） |
| ``middleware`` | ``mi`` | 中间件 |
| ``guard`` | ``gu`` | 守卫 |
| ``interceptor`` | ``in`` | 拦截器 |
| ``pipe`` | ``pi`` | 管道 |
| ``filter`` | ``f`` | 过滤器 |
| ``class`` | ``cl`` | 类 |

<hr />

## 为什么在Nestjs结合TypeORM时，禁止在生产环境中使用``synchronize:true``？
一句话总结原因：``synchronize: true`` 会让 **TypeORM 自动帮你执行数据库结构变更（DDL），这会导致不可控的数据丢失、表锁死以及无法回滚的灾难性后果。**

**1. 致命的数据丢失风险**

``synchronize: true`` 的作用是：每次应用启动时，比较你的 Entity（实体类）和数据库表结构，如果发现不一样，**它会自动修改数据库表结构去适应 Entity**。

- **场景**： 假设你把实体中的一个字段名从 ``username`` 改成了 ``name``。
- **TypeORM 的行为**： 它发现数据库里有 ``username`` 列，但实体里没有；实体里有 ``name`` 列，但数据库里没有。
- **结果**： TypeORM 会自动执行 ``ALTER TABLE DROP COLUMN username`` 和 ``ALTER TABLE ADD COLUMN name``。原来 ``username`` 列里的所有用户数据瞬间灰飞烟灭！ 它不会帮你做数据迁移。


**2. 导致严重的性能问题（表锁）**

在 MySQL 等关系型数据库中，执行 ``ALTER TABLE`` 操作（比如新增索引、修改字段类型、删除字段）通常会锁住整张表。

- 如果你的生产环境数据库里有几十万、上百万条数据，TypeORM 自动触发的 ``ALTER TABLE`` 可能需要执行几十秒甚至几分钟。
- 在这几分钟内，这张表的所有 **增删改查（INSERT/UPDATE/SELECT）请求都会被阻塞**。直接导致你的生产环境应用假死，用户无法访问。


**3. 缺乏事务安全与回滚机制**

现代软件工程要求数据库变更是可控的、可逆的。

- 自动同步没有“撤销”按钮。一旦它执行了错误的 ``DROP`` 或 ``ALTER``，你只能依靠数据库备份来恢复，而恢复备份往往意味着长时间的停机。
- 它无法处理复杂的迁移逻辑，比如：“把 A 列的数据拆分到 B 列和 C 列”。自动同步只认结构，不管数据。


**4. 多实例部署时的并发冲突**

在生产环境中，你通常会运行多个 NestJS 实例（比如使用 PM2 集群、Docker/K8s 容器）。

- 如果 3 个实例同时启动，它们可能同时检测到表结构不一致。
- 3 个实例同时尝试去执行 ``ALTER TABLE``，这会导致数据库死锁或者报错，应用直接启动失败。

<br />

**正确的做法是什么？**

在开发环境中，``synchronize: true`` 是可以用的，因为它能让你专心写代码，不用每次改个字段都去写 SQL，提升开发效率。

但在**生产环境**，必须使用 **Migration（迁移）** 来管理数据库结构：

**1. 关闭synchronize**:
```ts
TypeOrmModule.forRoot({
     // ...其他配置
     synchronize: process.env.NODE_ENV === 'development', // 只在开发环境开启
     // 或者直接写死 false，通过配置文件注入
})
```

**2. 使用 TypeORM 的 Migration 机制**：

Migration 本质上就是**版本控制的 SQL 脚本**。

当你需要修改表结构时，你手动生成一个迁移文件：
```bash
# 生成迁移文件（会对比实体和数据库的差异，生成一个待执行的 ts 文件）
npm run typeorm migration:generate -- -n RenameUsernameToName
```
这会生成类似这样的代码：
```ts
export class RenameUsernameToName1630000000000 implements MigrationInterface {
       public async up(queryRunner: QueryRunner): Promise<void> {
           // 你可以在这里精确控制 SQL，甚至保留数据
           await queryRunner.renameColumn('user', 'username', 'name');
       }

       public async down(queryRunner: QueryRunner): Promise<void> {
           // 提供回滚方案
           await queryRunner.renameColumn('user', 'name', 'username');
       }
}
```

**3. 在生产环境部署时执行迁移**：
```bash
# 运行尚未执行的迁移文件
npm run typeorm migration:run
```

<hr />

## 什么是QueryRunner？
**它是 TypeORM 给你提供的一个“底层方向盘”，让你可以直接、精细地控制数据库连接，执行原始 SQL，并手动管理数据库事务。**

**1. 为什么在 Migration（迁移）中会用到它？**

在上一个回答的迁移代码中，``up`` 和 ``down`` 方法都会接收一个 ``queryRunner`` 参数。这是因为**在执行数据库结构变更时，你不能使用常规的 Entity（实体类）操作**。

- **实体可能已经失效**： 假设你正在把 ``username`` 字段改名为 ``name``。在执行这个迁移时，你的代码里的 ``User`` 实体类已经是 ``name`` 字段了，但数据库里还是 ``username``。此时如果你尝试用 ``userRepository.save()``，TypeORM 会因为实体和数据库结构不匹配而报错。
- **需要执行 DDL 语句**： Migration 的核心是执行 DDL（数据定义语言，如 ``CREATE TABLE``、``ALTER TABLE``、``DROP COLUMN``）。QueryRunner 提供了专门的方法来安全地执行这些改变结构的语句，比如 ``queryRunner.createTable()``、``queryRunner.dropColumn()`` 等。
- **提供回滚能力**： ``QueryRunner`` 知道当前执行到哪一步了，配合 ``up``（执行）和 ``down``（回滚）方法，它可以帮助数据库恢复到迁移前的状态。


**2. QueryRunner 的三大核心能力**

除了在 Migration 中使用，在日常的业务代码中，遇到复杂场景时你也会用到它。

**能力一：执行原始 SQL（Raw SQL）**

当你觉得 TypeORM 的 ``find``、``where`` 写法太复杂，或者性能达不到要求时，可以直接写 SQL。
```ts
const users = await queryRunner.query('SELECT * FROM user WHERE age = ?', [1]);
```

**能力二：精细的事务控制（最重要的一点）**

通常我们用 ``@Transactional()`` 装饰器或者 ``Connection.transaction()`` 来管理事务。但如果你有一个**极其复杂的业务逻辑**，需要在不同条件下提交或回滚不同的部分，``QueryRunner`` 就派上用场了。
```ts
// 1. 获取 QueryRunner 并建立真实的数据库连接
const queryRunner = this.connection.createQueryRunner();
// 2. 开启事务
await queryRunner.startTransaction();

try {
  // 3. 在这个事务中执行操作
  await queryRunner.manager.save(user1);
  await queryRunner.manager.save(user2);
  
  if (somethingWrong) {
    // 4. 手动回滚
    await queryRunner.rollbackTransaction();
  } else {
    // 5. 手动提交
    await queryRunner.commitTransaction();
  }
} catch (err) {
  // 出错自动回滚
  await queryRunner.rollbackTransaction();
} finally {
  // 6. 最重要的一步：释放连接！
  // 如果不释放，数据库连接池会被耗尽，导致应用卡死
  await queryRunner.release();
}
```

**能力三：操作数据库结构（Schema/DDL）**
它内置了大量便捷方法来操作表结构（这也是 Migration 底层调用的东西）：

- ``queryRunner.createTable(table)``
- ``queryRunner.dropTable(tableName)``
- ``queryRunner.addColumn(table, column)``
- ``queryRunner.renameColumn(table, oldName, newName)``


**3. QueryRunner 和 Repository / EntityManager 的区别？**
| **特性** | **Repository/EntityManager** | **QueryRunner** |
| :--- | :--- | :--- |
| **抽象级别** | 高级API | 底层API |
| **操作对象** | 业务数据（行级操作，增删改查） | 数据库结构+业务数据（表级+行级）|
| **事务管理** | 自动管理（通常是单次操作的隐式事务） | 手动管理（``startTransaction``,``commit``,``rollback``） |
| **连接控制** | 框架自动从连接池借出和归还 | 需要手动``release()``归还连接池 |
| **适用场景** | 90%的日常业务增删改查 | 复杂的多表事务、执行原生SQL、数据库迁移 |

<hr />

## DataSource有什么用？
```ts
import { DataSource } from 'typeorm';

@Module({
  imports: [TypeOrmModule.forRoot(), UsersModule],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}

@Dependencies(DataSource)
@Module({
  imports: [TypeOrmModule.forRoot(), UsersModule],
})
export class AppModule {
  constructor(dataSource) {
    this.dataSource = dataSource;
  }
}
```
两段代码的区别仅仅是**语法糖**：

- 第一段是标准的 **TypeScript 写法**（利用 TS 的参数属性 ``private dataSource: DataSource``，自动帮你声明了属性并赋值）。
- 第二段是 **JavaScript (或旧版 TS) 写法**，需要手动声明 ``this.dataSource = dataSource;``，并使用 ``@Dependencies()`` 装饰器告诉 NestJS 依赖注入系统需要传入什么参数。

**它们的作用完全一样：在 NestJS 应用启动的那一刻，把 TypeORM 的“数据库总管”对象交到 ``AppModule`` 手里，方便你做全局的启动前干预。**

<br />

在 NestJS 结合 TypeORM（0.3.x 及以上版本）中，注入到 ``AppModule`` 构造函数里的 ``DataSource`` 是 TypeORM 的**绝对核心对象**。它取代了旧版 TypeORM 中的 ``Connection`` 对象。

如果把 TypeORM 比作一个数据库操作系统，那么 ``DataSource`` 就是**系统内核**。它包含了所有的数据库配置、连接池、实体元数据等。

把 ``DataSource`` 注入到 ``AppModule`` 的构造函数里，**最大的意义在于：利用 NestJS 的启动生命周期，在应用刚启动时（模块初始化阶段）执行一些底层的数据库操作**。


**1. DataSource 本身的核心能力（它能干什么？）**
无论在哪里注入 ``DataSource``，你都可以通过它做以下事情：

- **获取 Repository**： ``dataSource.getRepository(User)``（这是最常用的，和 ``@InjectRepository(User)`` 效果一样）。
- **获取 EntityManager**： ``dataSource.manager``。
- **创建 QueryRunner**： ``dataSource.createQueryRunner()``。
- **获取原生数据库驱动**： ``dataSource.driver``，可以直接拿到底层 mysql/pg 的连接池。


**2. 为什么要在 AppModule 的构造函数里注入它？（应用场景）**
在 ``AppModule`` 的构造函数里拿到 ``DataSource``，意味着这段代码会在**应用启动的瞬间执行**。通常用于以下场景：

**场景 A**：应用启动时自动运行 Seeding（种子数据填充）
比如你希望项目一启动，如果发现数据库里没有“管理员角色”，就自动创建一个。
```ts
export class AppModule implements OnModuleInit { // 注意这里实现了 OnModuleInit
  constructor(private dataSource: DataSource) {}

  async onModuleInit() {
    // 构造函数不能写 async，所以真正执行异步数据库操作要写在生命周期钩子里
    await this.seedInitialData();
  }

  private async seedInitialData() {
    const repo = this.dataSource.getRepository(Role);
    const count = await repo.count();
    if (count === 0) {
      await repo.save({ name: 'Admin' });
      console.log('初始数据填充完成');
    }
  }
}
```


**场景 B：启动时执行自定义的初始化 SQL**
如果你不想用 TypeORM 的 Migration，而是自己维护了一个 ``init.sql`` 文件，想在启动时读取并执行：
```ts
export class AppModule implements OnModuleInit {
  constructor(private dataSource: DataSource) {}

  async onModuleInit() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"'); // PostgreSQL 示例
    await queryRunner.release();
  }
}
```


**场景 C：多数据源（动态数据源）的预热与注册**
在复杂的 SaaS 系统中，可能有主库和几百个租户库。你可能需要在应用启动时，先通过主库的 ``DataSource`` 查出有哪些租户，然后提前初始化并缓存这些租户的 ``DataSource`` 实例。


**场景 D：全局事件监听（高级）**
你可以通过 ``DataSource`` 订阅全局的数据库日志或事件，用于统一的审计日志记录：
```ts
export class AppModule {
  constructor(private dataSource: DataSource) {
    this.dataSource.subscribers.push(new CustomLoggingSubscriber());
  }
}
```

### ⚠️ 一个非常重要的避坑细节
正如你在代码中看到的，它被放在了 ``constructor`` 里。
**注意：NestJS 的构造函数是同步执行的，你不能在构造函数里写 ``await this.dataSource.xxx()``！**

如果你需要在应用启动时**查询数据库或插入数据**（这必定是异步操作），你不能直接写在 ``constructor`` 里，必须配合 NestJS 的生命周期接口：
```ts
import { Module, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Module({
  imports: [TypeOrmModule.forRoot(), UsersModule],
})
export class AppModule implements OnModuleInit { // 1. 实现此接口
  constructor(private dataSource: DataSource) {} // 2. 注入拿到实例

  // 3. 在这里执行异步的数据库初始化操作
  async onModuleInit() {
    console.log('应用启动中，开始执行数据库初始化检查...');
    const isConnected = this.dataSource.isInitialized;
    if (isConnected) {
      console.log('数据库连接池已成功建立！');
      // 在这里执行你的 queryRunner 或 getRepository 操作
    }
  }
}
```

<hr />

## 思考：为什么在进行数据迁移时，即使配置了``synchronize:false``，在生成迁移文件时，还是会执行类似于``drop``这样的危险操作？

因为 ``synchronize: false`` 只影响应用启动时是否自动同步数据库结构，不影响你手动生成迁移文件时 TypeORM 的“差异推断方式”。

也就是说:
```ts
synchronize: false
```
表示：
>Nest应用启动时，不要自动根据实体改数据库表。

它不会阻止你执行；
```bash
npm run typeorm -- migration:generate ...
```

而``migration:generate`` 会做另一件事：
>对比“当前数据库结构”和“当前实体定义”，然后自动生成一组 SQL，让数据库变成实体的样子。

问题就在这里：TypeORM 不知道你是把字段 ``name`` 重命名成了 ``title``。

它只看到：
```txt
数据库里有 name
实体里没有 name
实体里有 title
数据库里没有 title
```

所以它推断成：
```sql
DROP COLUMN name;
ADD COLUMN title;
```
而不是：
```sql
RENAME COLUMN name TO title;
```
因为对 ORM 来说，``name -> title`` 和 “删除 ``name``，新增 ``title``” 在结构差异上看起来很像。它没有足够信息判断这是一次“重命名”。

所以重点是：
>``synchronize: false`` 防的是运行时自动改库；
>``migration:generate`` 仍然可能生成危险 SQL；
>自动生成的迁移文件必须人工审查。

安全做法是人工改成：
```sql
ALTER TABLE "coffee" RENAME COLUMN "name" TO "title";
```

所以迁移的一条经验是：
>字段重命名、表重命名、拆表、合表、数据搬迁，不能完全相信自动生成，必须手写或人工修改迁移。

<hr />

## 思考：在运行``npm run migration:run``时，实际上发生了什么？

1. **``npm``脚本解析**

``npm``会去``package.json``中寻找``migration:run``对应的脚本命令。通常这样：
```json
"migration:run":"ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:run -d src/data-source.ts"
```
或者使用NestJS CLI的方式：
```json
"migration:run":"nest command migration:run"
```

<br />

2. **TypeORM CLI启动与数据源加载**

底层都是调用了TypeORM CLI。CLI启动后，第一步是根据``-d``参数（或默认配置）加载数据源（DataSource）。

- 它会读取数据库连接配置（主机、端口、用户名、密码、数据库名）。
- 它会加载项目中所有的 Entity（实体类），以便与数据库表结构进行对比。

<br />

3. **建立数据库连接并查找/创建系统表**

TypeORM连接到数据库后，会去寻找一张名为migrations的系统表（表名可以在配置中自定义）。

- **如果这张表不存在**：说明这是该数据库第一次运行迁移，TypeORM 会自动创建这张 ``migrations`` 表。这张表用来记录哪些迁移文件已经执行过了。
- **如果这张表已存在**：TypeORM 会读取这张表里的记录。

<br />

4. **对比与计算差异**

这是核心步骤。TypeORM 会做两件事：

- **扫描代码**：扫描你项目中所有注册的迁移类（即那些带有 ``@Migration()`` 装饰器或继承了 ``MigrationInterface`` 的文件）。
- **查询数据库**：读取 ``migrations`` 表中已经执行过的记录（通常包含迁移文件名和时间戳）。

TypeORM 将代码中的迁移文件与数据库中已执行的记录进行**差集计算**，找出**尚未执行**的迁移文件。

<br />

5. **执行``up()``方法**

对于计算出的未执行迁移，TypeORM 会按照一定的顺序（下一节详细讲）依次执行每个迁移类中的 ``up()`` 方法。这里面包含了真实的 SQL 语句（如建表、加字段、加索引等）。

<br />

6. **写入执行记录**

**关键点**：当一个迁移文件的 ``up()`` 方法成功执行完毕后，TypeORM 会立即向数据库的 ``migrations`` 表中插入一条新记录，包含该迁移的名字和执行时间戳。

<br />

7. **断开连接**

所有待执行的迁移跑完后，TypeORM 关闭数据库连接，进程退出。

<hr />

## 如果存在多个版本的迁移，实际上发生了什么？

假设你的项目中有 3 个未执行的迁移文件，分别是：

1. ``1700000000000-CreateUserTable.ts``
2. ``1700000000001-AddEmailToUser.ts``
3. ``1700000000002-CreatePostTable.ts``

当运行 ``npm run migration:run`` 时，会发生以下情况：

<br />

### 1. 严格的顺序执行（基于时间戳排序）

TypeORM **绝对不会**同时并发执行多个迁移，也不会随机执行。它严格按照迁移文件名中的**时间戳（Timestamp）前缀**进行**升序排序**。

执行顺序绝对是：``CreateUserTable`` -> ``AddEmailToUser`` -> ``CreatePostTable``。这保证了数据库结构的演变符合代码逻辑的时间线（比如：必须先有 User 表，才能给 User 加字段）。

<br />

### 2. 逐个提交与记录（防止中途崩溃导致数据损坏）

这是极其重要的安全机制。TypeORM 的默认行为是：**每个迁移文件独立包裹在一个事务中（取决于数据库引擎是否支持），并且跑完一个立刻记录一个**。

具体流程如下：

- **第一步**：开启事务，执行 ``CreateUserTable`` 的 ``up()`` 方法，提交事务。立刻在 ``migrations`` 表中写入 ``CreateUserTable`` 的执行记录。
- **第二步**：开启事务，执行 ``AddEmailToUser`` 的 ``up()`` 方法，提交事务。立刻在 ``migrations`` 表中写入 ``AddEmailToUser`` 的执行记录。
- **第三步**：开启事务，执行 ``CreatePostTable`` 的 ``up()`` 方法，提交事务。立刻在 ``migrations`` 表中写入 ``CreatePostTable`` 的执行记录。

<br />

### 3. 如果中途报错了怎么办？

假设在执行第二步 ``AddEmailToUser`` 时，SQL 语法写错了导致报错。会发生什么？

- 第二步的**当前事务会被回滚**，``AddEmailToUser`` 对数据库的修改无效。
- 进程崩溃退出。
- **第一步 ``CreateUserTable`` 的修改依然保留**在数据库中，且 ``migrations`` 表中也有它的成功记录。

**下次你再次运行 ``npm run migration:run`` 时**：

TypeORM 对比后发现 ``CreateUserTable`` 已经跑过了，只会从失败的 ``AddEmailToUser`` 开始继续往下跑。这种机制保证了数据库状态的一致性和可恢复性。

<hr />

### 💡 总结与最佳实践

1. **幂等性不可靠**：TypeORM 是通过 ``migrations`` 表记录来决定是否执行迁移的，它**绝对不会在执行前检查数据库的实际物理表结构**。如果 ``migrations`` 表没有记录，哪怕物理表已经存在，它依然会执行 ``up()`` 中的 ``CREATE TABLE``，从而导致报错。

2. **时间戳是生命线**：永远不要手动重命名迁移文件的时间戳前缀，不要打乱文件的自然排序，否则会导致数据库状态与代码严重脱节。

3. **生成迁移而非手写**：在 NestJS 中，推荐使用 ``npm run migration:generate -- -n AddNewColumn``。这个命令会对比你的 Entity 定义和数据库实际结构，自动生成包含正确 SQL 的迁移文件，极大降低手写 SQL 出错的概率。

<hr />

## 在``providers``中，还有哪些类似于``useClass``这样的属性？

<br />

### 1.``useClass``

用某个类来创建实例。
```ts
{
    provide:CoffeesService,
    useClass:CoffeesService,
}
```
也可以替换实现：
```ts
{
    provide:CoffeesService,
    useClass:MockCoffeesService
}
```

<br />

### 2.``useValue``

直接提供一个现成的值或对象，测试里很常见。
```ts
{
    provide:CoffeesService,
    useValue:{
      findAll:()=>[]
    }
}
```
意思是：谁注入``CoffeesService``，就拿到这个对象。

<br />

### 3.``useFactory``

用工厂函数动态创建``provider``。
```ts
{
    provider:'DATABASE_OPTIONS',
    useFactory:()=>({
      host:'localhost',
      port:5432
    })
}
```

也可以注入别的``provider``：
```ts
{
    provide:'DATABASE_OPTIONS',
    useFactory:(configService:ConfigService)=>({
        host:configService.get('DB_HOST')
    }),
    inject:[ConfigService]
}
```
这里的``inject``表示工厂函数需要哪些依赖。

<br />

### 4.``useExisting``

给已有``provider``起一个别名。
```ts
{
    provide:'COFFEE_SERVICE_ALIAS',
    useExisting:CoffeesService
}
```
意思是：注入``'COFFEE_SERVICE_ALIAS'``时，拿到的其实还是``CoffeesService``那个实例。

<hr />

## 思考：在NestJS中，``useClass``和``useValue``如果同时存在，会发生什么？

在 NestJS 中，如果在一个 Provider 的配置中同时存在 ``useClass`` 和 ``useValue`` 属性，会发生以下情况：

<br />

### 1. TypeScript 编译期：类型报错（正常情况下）

NestJS 的类型定义非常严格。在 TypeScript 环境下，``Provider`` 是一个联合类型，它由 ``ClassProvider``、``ValueProvider``、``FactoryProvider`` 等接口组成。

NestJS 的类型定义将这些提供者方式设计为**互斥**的。如果你同时写上 ``useClass`` 和 ``useValue``，TypeScript 编译器会直接报错，提示你这是无效的类型组合，你的代码根本无法通过编译。
```ts
{
    provide:'MY_TOKEN',
    useClass:MyService,
    useValue:{foo:bar}
}
```

<br />

### 2. 运行时：``useValue``优先（如果绕过了类型检查）

如果你使用的是纯 JavaScript，或者通过 ``as any`` 强行绕过了 TypeScript 的类型检查，那么在 NestJS 的运行时内部，**``useValue`` 会生效，而 ``useClass`` 会被忽略**。

<br />

**原因在于 NestJS 内部的解析顺序**：

NestJS 的 IoC 容器在解析自定义提供者时，会按照固定的顺序去检查对象的属性。其内部逻辑大致如下：

1. 先检查有没有 ``useValue``，如果有，直接返回这个值。
2. 如果没有，检查有没有 ``useClass``，如果有，去实例化这个类。
3. 如果没有，检查有没有 ``useFactory``…
4. 最后检查 ``useExisting``。

因为 ``useValue`` 的检查顺序在 ``useClass`` 之前，所以当容器发现 ``useValue`` 存在时，就会直接使用它，后面的 ``useClass`` 根本不会被执行。
```js
//纯JS或as any绕过检查
{
    provide:'MY_TOKEN',
    useClass:MyService,
    useValue:{foo:bar}
}
//实际运行结果：注入 'MY_TOKEN' 时，得到的是 { foo: 'bar' }，MyService 不会被实例化。
```

### 总结与最佳实践

- **理论上**：两者不能同时存在，TypeScript 会在编译期拦截。
- **实际上**：如果强行同时存在，``useValue`` 具有更高的优先级，``useClass`` 会被丢弃。
- **最佳实践**：永远不要将 ``useValue``、``useClass``、``useFactory``、``useExisting`` 混用在同一个提供者对象中。根据你的场景选择唯一的一种：
    - 想提供现成的对象/常量：用 ``useValue``
    - 想让 Nest 自动实例化一个类：用 ``useClass``
    - 想通过动态函数生成提供者：用 ``useFactory``
    - 想使用已有的提供者别名：用 ``useExisting``

<hr />

## 在Nest中，如何实现动态模块？

在 NestJS 中，动态模块是框架最强大、最核心的特性之一。它允许你创建可复用的模块，并能根据传入的参数（如配置项、环境变量等）在运行时动态地改变模块的行为、提供者或导出内容。

NestJS 实现动态模块的核心机制依赖于**静态方法**和**DynamicModule**接口。

<br />

### 1. 核心原理：静态方法返回DynamicModule

普通模块使用 ``@Module()`` 装饰器静态定义元数据，一旦定义就无法更改。而动态模块的做法是：**在模块类上定义一个静态方法，该方法接收配置参数，并返回一个 ``DynamicModule`` 对象**。

``DynamicModule`` 接口和普通 ``@Module()`` 的元数据结构几乎一样，但多了一个必须的 ``module`` 属性，用来指定该动态模块属于哪个类。

<br />

### 2. 标准实现步骤

假设要创建一个数据库连接模块 ``DatabaseModule``，需要根据传入的配置连接不同的数据库。

<br />

**步骤1：定义配置接口**

定义模块需要接收的参数类型：
```ts
export interface DatabaseModuleOptions {
    host:string;
    port:number;
    username:string;
    password:string;
}
```

<br />

**步骤2：创建模块并编写静态方法**

在模块类中添加静态方法（通常命名为 ``forRoot`` 或 ``register``），返回 ``DynamicModule``。
```ts
import {Module,DynamicModule,Provider} from '@nestjs/common'
import {DatabaseModuleOptions} from './interfaces'
import {DatabaseService} from './database.service'

@Module({})
export class DatabaseModule {
    //静态方法，接收配置参数
    static forRoot(options:DatabaseModuleOptions):DynamicModule{
        
        //1. 创建一个自定义Provider，将配置对象注入到容器中
        const optionsProvider:Provider={
            provide:'DATABASE_OPTIONS',
            useValue:options  
        };

        //2. 返回DynamicModule对象
        return {
            module:DatabaseModule,                         //必填：指明这个动态模块属于DatabaseModule
            providers:[optionsProvider,DatabaseService],   //注册提供者
            exports:[DatabaseService],                     //导出提供者，供外部使用
            global:true                                    //可选：设为全局模块，这样其他模块就不用再 imports 了
        }
    }
}
```

<br />

**步骤3：在服务中使用配置**

``DatabaseService`` 可以通过注入 ``'DATABASE_OPTIONS'`` 这个 Token 来获取配置：
```ts
import {Injectable,Inject} from '@nestjs/common'
import {DatabaseModuleOptions} from './interfaces'

@Injectable()
export class DatabaseService {
    constructor(@Inject('DATABASE_OPTIONS') private options:DatabaseModuleOptions){
        console.log(`Connecting to ${options.host}:${options.port}...`);
    }
}
```

<br />

**步骤4：在AppModule中使用**

调用静态方法来导入模块，而不是直接写类名：
```ts
import {Module} from '@nestjs/common'
import {DatabaseModule} from './database/database.module'

@Module({
    imports:[
        //调用静态方法，传入配置
        DatabaseModule.forRoot({
            host:'localhost',
            port:5432,
            username:'admin',
            password:'123456'
        })
    ]
})
export class AppModule {
    
}
```

<br />

### 3. 动态模块的命名规范

NestJS 社区对动态模块的静态方法有一套强约定俗成的命名规范，遵循这些规范能让你的代码更具可读性：
| **方法名** | **使用场景** | **典型代表** | **特点** |
| :--- | :--- | :--- | :--- |
| ``forRoot`` | 只在根模块调用一次，配置全局基础依赖 | ``TypeOrmModule.forRoot()`` | 常配合 ``global: true`` 使用，只初始化一次。 |
| ``forFeature`` | 在各个业务模块中调用，注册特定功能 | ``TypeOrmModule.forFeature([UserEntity])`` | 依赖 ``forRoot`` 提供的基础配置，注册局部内容。 |
| ``register`` | 在任何需要的地方调用，每次调用都是独立的 | ``ConfigModule.register()`` | 不像 ``forRoot`` 那样有全局/局部依赖关系，哪里需要哪里注册。 |

<br />

### 4. 异步配置

在真实开发中，配置参数往往不是硬编码的，而是需要从远程拉取、或依赖另一个异步服务（如 ``ConfigService``）。NestJS 提供了 ``forRootAsync`` 来支持异步加载配置。

核心是使用 ``useFactory``、``useClass`` 或 ``useExisting`` 配合 ``inject``：
```ts
import {Module,DynamicModule} from 'nestjs/common'
import {ConfigModule,ConfigService} from 'nestjs/config'

@Module({})
export class DatabaseModule {
  static forRootAsync(): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [ConfigModule], // 确保 ConfigModule 已导入
      providers: [
        {
          provide: 'DATABASE_OPTIONS',
          useFactory: (configService: ConfigService) => {
            // 异步或依赖其他服务获取配置
            return {
              host: configService.get('DB_HOST'),
              port: configService.get('DB_PORT'),
            };
          },
          inject: [ConfigService], // 注入依赖
        },
        DatabaseService,
      ],
      exports: [DatabaseService],
    };
  }
}
```

<hr />

## 底层原理：Nest 是如何合并模块的？

当 NestJS 启动时，它扫描 ``AppModule`` 的 ``imports`` 数组。如果发现某个导入是一个对象而不是类（比如调用了 DatabaseModule.``forRoot()`` 返回的对象），NestJS 会做以下处理：

1. **提取 ``module`` 属性**：NestJS 读取返回对象中的 ``module: DatabaseModule``，知道这个配置属于 ``DatabaseModule`` 类。
2. **合并元数据**：NestJS 会将 ``@Module({})`` 装饰器中静态定义的元数据，与 ``forRoot()`` 返回的动态元数据进行深度合并。
- 如果静态模块里有一个 ``Provider``，动态方法又返回了三个 ``Provider``，最终容器里会有四个 ``Provider``。
- 注意：如果在静态 ``@Module`` 中和动态返回对象中注册了相同 Token 的 ``Provider``，**动态返回的会覆盖静态的**。
3. **注册到 IoC 容器**：合并后的完整模块定义被注册到依赖注入容器中，后续的解析过程与普通模块完全一致。

**总结**:NestJS 动态模块的实现本质上是**将模块的定义从“声明式（装饰器）”延迟到了“运行时（函数调用）”**。通过在模块类上暴露返回 **DynamicModule** 的静态方法，巧妙地利用了 JavaScript 语言的动态特性，配合 IoC 容器的元数据合并机制，实现了高度灵活和可配置的模块化架构。

<hr />

## 在Nestjs中，注入作用域的覆盖关系具体是怎样的？

在 NestJS 中，注入作用域的覆盖关系是一个非常核心且容易踩坑的机制。核心原则可以用一句话概括：**作用域是“向上冒泡”的，生命周期短的提供者会“提升”生命周期长的提供者**。

这是因为依赖注入的本质是：**父组件（注入方）不能比它依赖的子组件（被注入方）活得更久**，否则父组件会在其生命周期内持有一个已经死亡的子组件实例，导致状态混乱。

<br />

### 规则一：作用域冒泡与提升矩阵

NestJS 的三种作用域生命周期长短排序为：
``DEFAULT (单例)`` > ``REQUEST (请求级)`` > ``TRANSIENT (瞬态)``

当组件 A 依赖（注入）组件 B 时，组件 A 的最终作用域由两者中**生命周期最短**的那个决定。

| **组件A作用域（注入方）** | **组件B作用域（被依赖方）** | **组件A最终作用域** | **原因** |
| :--- | :--- | :--- | :--- |
| **DEFAULT** | **DEFAULT** | DEFAULT | 都是单例，互不影响 |
| **DEFAULT** | **REQUEST** | **REQUEST** ⚠️ | A 必须伴随每个请求重生，否则会跨请求共享 B |
| **DEFAULT** | **TRANSIENT** | **TRANSIENT** ⚠️ | A 必须每次注入都重生，否则会重复使用 B |
| **REQUEST** | **DEFAULT** | REQUEST | B 是单例，A 每次请求新生成，注入的都是同一个 B，合法 |
| **REQUEST** | **REQUEST** | REQUEST | 同生同灭，合法 |
| **REQUEST** | **TRANSIENT** | **TRANSIENT** ⚠️ | A 必须每次注入都重生，退化成瞬态 |
| **TRANSIENT** | **DEFAULT** | TRANSIENT | 合法 |
| **TRANSIENT** | **REQUEST** | TRANSIENT | 合法（每次新建 A 时，获取当前请求的 B） |
| **TRANSIENT** | **TRANSIENT** | TRANSIENT | 合法 |

举个例子：
```ts
@Injectable() // 默认 DEFAULT 单例
export class UserService {
  constructor(private readonly cacheService: CacheService) {}
}

@Injectable({ scope: Scope.REQUEST }) // 请求级
export class CacheService {}
```
**结果**： 虽然 ``UserService`` 声明为默认单例，但因为它是 ``CacheService`` 的宿主，为了确保每个请求拿到独立的 ``CacheService``，NestJS 会**强制将 ``UserService`` 的作用域提升为 ``REQUEST``**。

<hr />

### 规则二：声明位置的优先级覆盖

作用域可以在两个地方声明：

1. 类装饰器：``@Injectable({ scope: Scope.REQUEST })``
2. 模块注册时（自定义提供者）：``{ provide: UserService, useClass: UserService, scope: Scope.REQUEST }``

**覆盖规则：模块注册时的 ``scope`` 优先级高于类装饰器上的 ``scope``**。

```ts
// 1. 类上声明为 DEFAULT
@Injectable() 
export class UserService {}

// 2. 模块中声明为 REQUEST
@Module({
  providers: [
    {
      provide: UserService,
      useClass: UserService,
      scope: Scope.REQUEST, // 优先级更高！最终 UserService 是 REQUEST 作用域
    },
  ],
})
export class UserModule {}
```
这种机制允许你在不修改源码的情况下，动态改变第三方库提供者的作用域。

<br />

### 规则三、控制器的作用域传染链

Controller 本身也可以声明作用域 (``@Controller({ scope: Scope.REQUEST })``)。

由于 Controller 是请求处理的入口，**Controller 的作用域会向下传染给所有它注入的 DEFAULT 作用域的 Service**。
```ts
@Controller({ scope: Scope.REQUEST })
export class UserController {
  constructor(private readonly userService: UserService) {} // UserService 会被提升为 REQUEST
}
```
如果一个单例 Service 被一个 REQUEST 的 Controller 和另一个单例 Controller 同时注入，那么**该 Service 会被提升为 REQUEST**，每次请求都会重新创建。

<br />

### 规则四、跨模块的作用域传染

作用域冒泡是不受模块边界限制的。

如果 ``ModuleA`` 中的 ``SingletonServiceA``（单例）注入了 ``ModuleB`` 导出的 ``RequestServiceB``（请求级），那么 **``SingletonServiceA`` 及其所在的整条依赖链都会被提升为 ``REQUEST`` 作用域**。

这是极其危险的，可能会引发大面积的不可预期的性能问题（大量原本可以复用的单例变成了每次请求新建的对象）。

<br />

### 如何打破作用域冒泡？（最佳实践）

因为作用域提升会导致性能损耗（频繁创建和销毁实例），NestJS 官方强烈建议默认使用 ``DEFAULT`` 单例。如果确实需要在单例中使用请求级数据，**不要通过提升作用域来解决，而是使用 ``@Inject(REQUEST)`` 注入请求对象引用**。

**错误的用法（导致作用域提升）**：
```ts
@Injectable()
export class SingletonService {
  constructor(private readonly requestService: RequestService) {} // 导致 SingletonService 变成 REQUEST
}
```

**正确的用法（保持单例，手动获取请求上下文）**：
```ts
import { REQUEST } from '@nestjs/core';
import { Inject, Injectable } from '@nestjs/common';

@Injectable() // 保持单例
export class SingletonService {
  constructor(@Inject(REQUEST) private readonly request: Request) {} 
  
  doSomething() {
    // 通过 request 对象获取请求级数据，无需提升作用域
    const tenantId = this.request.headers['x-tenant-id']; 
  }
}
```
通过注入 ``REQUEST``（或 ``CONTEXT``），单例服务可以安全地访问当前请求的上下文，而不会触发作用域冒泡机制。

<br />

### 总结

1. **谁短听谁的**：依赖链中生命周期最短的组件决定了整条链的作用域。
2. **模块覆盖类**：Module 注册配置的优先级大于 ``@Injectable`` 装饰器的配置。
3. **慎用非单例**：除非明确需要，否则保持 ``DEFAULT``，遇到需要请求上下文的场景，优先使用 ``@Inject(REQUEST)`` 而非改变作用域。
## 笔记

<hr />

### 为什么在Nestjs结合TypeORM时，禁止在生产环境中使用``synchronize:true``？
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

### 什么是QueryRunner？
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

### DataSource有什么用？
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

#### ⚠️ 一个非常重要的避坑细节
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
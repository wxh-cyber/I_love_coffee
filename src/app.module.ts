import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoffeesModule } from './coffees/coffees.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoffeeRatingModule } from './coffee-rating/coffee-rating.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';

//根模块，注册全局controller和provider(包括coffees相关类)
//TypeORM.forRoot主要作用是在根模块注册一次，从而建立数据库连接
@Module({
  imports: [
    ConfigModule.forRoot({}),
    CoffeesModule,
    TypeOrmModule.forRoot({
    type:'postgres',
    host:process.env.DATABASE_HOST,
    //默认从.env获取到的值类型都是字符串，因此需要对port的值进行类型转换
    port:+process.env.DATABASE_PORT,
    username:process.env.DATABASE_USER,
    password:process.env.DATABASE_PASSWORD,
    database:process.env.DATABASE_NAME,
    autoLoadEntities:true,             //设置自动加载模块
    synchronize:false,                  //TypeORM实体在每次运行程序，都与数据库同步
    //注意：不要在生产环境中设置synchronize:true;
  }), 
  CoffeeRatingModule, 
  DatabaseModule
],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

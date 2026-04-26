import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoffeesModule } from './coffees/coffees.module';
import { TypeOrmModule } from '@nestjs/typeorm';

//根模块，注册全局controller和provider(包括coffees相关类)
//TypeORM.forRoot主要作用是在根模块注册一次，从而建立数据库连接
@Module({
  imports: [CoffeesModule,TypeOrmModule.forRoot({
    type:'postgres',
    host:'localhost',
    port:5432,
    username:'postgres',
    password:'pass123',
    database:'postgres',
    autoLoadEntities:true,             //设置自动加载模块
    synchronize:true,                  //TypeORM实体在每次运行程序，都与数据库同步
    //注意：不要在生产环境中设置synchronize:true;
  })],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

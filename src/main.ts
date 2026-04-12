import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

//应用程序的入口文件，使用核心函数NestFactory来创建Nest应用程序实例
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,      // 只允许白名单中的属性
    forbidNonWhitelisted: true,  // 禁止非白名单中的属性
    transform: true,      // 自动转换属性类型
  }));
  await app.listen(3000);
}
bootstrap();

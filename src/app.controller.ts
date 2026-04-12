import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

//根路由控制器，处理GET /请求
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

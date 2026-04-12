import { Injectable } from '@nestjs/common';

//AppController依赖的provider服务
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello Nest';
  }
}

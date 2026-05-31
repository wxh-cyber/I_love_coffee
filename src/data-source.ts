import {DataSource} from 'typeorm';
import { Coffee } from './coffees/entities/coffees.entity';
import { Flavor } from './coffees/entities/flavor.entity';
import { Event } from './events/entities/event.entity/event.entity';

export default new DataSource({
    type:'postgres',
    host:'localhost',
    port:5432,
    username:'postgres',
    password:'pass123',
    database:'postgres',
    entities:[Coffee,Flavor,Event],
    //相对路径，以确保能找到根目录下的对应文件夹
    migrations:['migrations/*{.ts,.js}'],
    //迁移配置必须设置同步为false
    synchronize:false
});
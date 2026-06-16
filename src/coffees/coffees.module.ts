import { Module,Injectable } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoffeesController } from './coffees.controller';
import { CoffeesService } from './coffees.service';
import { ConfigModule } from '@nestjs/config';
import { COFFEE_BRANDS } from './coffees.constants';
import { Coffee } from './entities/coffees.entity';
import { Flavor } from './entities/flavor.entity';
import { Event } from '../events/entities/event.entity/event.entity'
import coffeesConfig from './config/coffees.config';
import { DataSource } from 'typeorm';
import dataSource from 'src/data-source';

// @Injectable()
// export class CoffeeBrandsFactory {
//     create(){
//         /* do something ... */
//         return ['buddy brew','nescafe'];
//     }
// }

@Module({
    imports: [
        TypeOrmModule.forFeature([Coffee,Flavor,Event]),
        ConfigModule.forFeature(coffeesConfig)
    ],
    controllers: [CoffeesController],
    
    //依赖注入的完整写法
    providers: [
        CoffeesService
        // CoffeeBrandsFactory,
        // {
        //     provide:COFFEE_BRANDS,
        //     useFactory:async (dataSource:DataSource):Promise<string[]>=>{
        //         //const coffeeBrands=await dataSource.query('SELECT * FROM brand');
        //         const coffeeBrands=await Promise.resolve(['buddy brew','nescafe']);
        //         console.log('[!] Async factory');
        //         return coffeeBrands;
        //     },
        //     inject:[DataSource]
        // }
    ],
    exports:[CoffeesService]
})
export class CoffeesModule {}

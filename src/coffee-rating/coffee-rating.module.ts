import { Module } from '@nestjs/common';
import { CoffeesModule } from 'src/coffees/coffees.module';
import { CoffeeRatingService } from './coffee-rating.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports:[
    DatabaseModule.register({
        type:'postgres',
        host:'localhost',
        password:'pass123',
        port:5432
    }),
    CoffeesModule],
  providers: [CoffeeRatingService]
})
export class CoffeeRatingModule {

}

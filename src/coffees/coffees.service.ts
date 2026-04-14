import { HttpException, HttpStatus, Injectable,NotFoundException } from '@nestjs/common';
import { Coffee } from './entities/coffees.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCoffeeDto } from './dto/create-coffee.dto/create-coffee.dto';

//咖啡业务逻辑与内存数据
@Injectable()
export class CoffeesService {
    //private coffees: Coffee[] = [];

    constructor(
        @InjectRepository(Coffee)
        private readonly coffeeRepository: Repository<Coffee>,
    ) {}

    findAll(){
        return this.coffeeRepository.find();
    }

    async findOne(id:string){
        /**
         * TypeORM v0.2(旧版)：
         * this.coffeeRepository.findOne(id)     //直接传id
         * 
         * TypeORM v0.3+(新版)：
         * this.coffeeRepository.findOne({ where: { id: +id} })    //必须用对象
         * 
         * 原因：旧版findOne(id)的设计有歧义——传入的参数既可能是主键，也可能是查询条件对象，容易混淆。
         *      v0.3统一改为只接受FindOneOptions对象，语义更清晰，where明确表示过滤条件。
         * 
         * FindOneOptions主要字段：
         * where:
         *     类型：object/array
         *     作用：过滤条件，最常用
         *
         * relations:
         *     类型：array/object
         *     作用：同时加载关联实体（JOIN）
         * 
         * select:
         *     类型：array/object
         *     作用：只查询指定的列
         * 
         * order:
         *     类型：object
         *     作用：排序
         * 
         * cache:
         *     类型：boolean/number
         *     作用：查询缓存。
         * 
         * withDeleted:
         *     类型：boolean
         *     作用：是否包含软删除的记录
         * 
         * loadEagerRelations:
         *     类型：boolean
         *     作用：是否加载了eager:true的关联
         * 
         * comment:
         *     类型：string
         *     作用：给SQL加注释（调试用）
         */
        const coffee=await this.coffeeRepository.findOne({
            where:{ id:+id },
        });
        if(!coffee){
            throw new NotFoundException(`Coffee #${id} not found`);
        }
        return coffee;
    }

    create(createCoffeeDto:CreateCoffeeDto){
        const coffee=this.coffeeRepository.create(createCoffeeDto);
        return this.coffeeRepository.save(coffee);
    }

    update(id:string,updateCoffeeDto:any){
        const existingCoffee=this.findOne(id);
        if(existingCoffee){
            
        }
    }

    remove(id:string){
        const coffeeIndex=this.coffees.findIndex(coffee=>coffee.id===+id);
        if(coffeeIndex>=0){
            this.coffees.splice(coffeeIndex,1)
        }
    }
}

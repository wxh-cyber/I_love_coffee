import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository,DataSource } from 'typeorm';
import { CreateCoffeeDto } from './dto/create-coffee.dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto/update-coffee.dto';
import { Coffee } from './entities/coffees.entity';
import { Flavor } from './entities/flavor.entity';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto/pagination-query.dto';
import { Event } from '../events/entities/event.entity/event.entity';

//咖啡业务逻辑与内存数据
@Injectable()
export class CoffeesService {
    //private coffees: Coffee[] = [];

    //通过@InjectRepository把TypeORM的Repository<Coffee>注入进来，后续所有的数据库操作都通过coffeeRepository完成
    constructor(
        @InjectRepository(Coffee)
        private readonly coffeeRepository: Repository<Coffee>,
        @InjectRepository(Flavor)
        private readonly flavorRepository: Repository<Flavor>,
        private readonly dataSource: DataSource,
    ) {}

    //等价于select * from coffee
    findAll(pagination:PaginationQueryDto){
        const { limit, offset } = pagination;

        return this.coffeeRepository.find({
            relations:['flavors'],
            skip:offset,
            take:limit
        });
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
            relations:['flavors']
        });
        if(!coffee){
            throw new NotFoundException(`Coffee #${id} not found`);
        }
        return coffee;
    }

    async create(createCoffeeDto:CreateCoffeeDto){
        const flavors=await Promise.all(
            createCoffeeDto.flavors.map(name => this.preloadFlavorByName(name))
        );

        const coffee=this.coffeeRepository.create({
            ...createCoffeeDto,
            flavors,
        });    //DTO -> Entity实例
        return this.coffeeRepository.save(coffee);                     //insert入库
    }

    async update(id:string,updateCoffeeDto:UpdateCoffeeDto){
        //preload：先按id从库里查，再用传入的字段覆盖，返回合并后的实体
        const flavors=updateCoffeeDto.flavors&&(await Promise.all(
            updateCoffeeDto.flavors.map(name => this.preloadFlavorByName(name))
        ));

        const coffee=updateCoffeeDto.flavors&&(await this.coffeeRepository.preload({
            id:+id,
            ...updateCoffeeDto,
            flavors
        }));
        if(!coffee){
            throw new NotFoundException(`Coffee #${id} not found`);
        }

        return this.coffeeRepository.save(coffee);
    }

    async remove(id:string){
        const coffee=await this.findOne(id);
        return this.coffeeRepository.remove(coffee);
    }

    async recommendCoffee(coffee:Coffee){
        const queryRunner=this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            coffee.recommendations++;

            const recommendEvent = queryRunner.manager.create(Event, {
                name: 'recommend_coffee',
                type: 'coffee',
                payload: { coffeeId: coffee.id },
            });

            await queryRunner.manager.save(coffee);
            await queryRunner.manager.save(recommendEvent);

            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    private async preloadFlavorByName(name:string):Promise<Flavor>{
        const existingFlavor=await this.flavorRepository.findOne({
            where: { name },
        });
        if(existingFlavor){
            return existingFlavor;
        }
        return this.flavorRepository.create({name});
    }
}

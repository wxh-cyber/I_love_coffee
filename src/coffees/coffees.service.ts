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
    /**
     *   @function findAll
     *   @param {PaginationQueryDto} pagination - 分页DTO
     *   @description 按分页参数从数据库查询Coffee列表，并同时加载每个Coffee关联的flavors数据。
     */
    findAll(pagination:PaginationQueryDto){
        //limit，一次最多查多少条，offset，跳过前面多少条
        const { limit, offset } = pagination;

        //调用TypeORM的find查询Coffee表
        return this.coffeeRepository.find({
            relations:['flavors'],                       //顺便查出关联的flavors，相当于把咖啡口味也一起带出来
            skip:offset,                                 //跳过指定数量的数据
            take:limit                                   //限制返回数量
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

    /**
     *   @function create
     *   @param {CreateCoffeeDto} createCoffeeDto 
     *   @description 创建一条Coffee记录，并处理它和Flavor的多对多关联关系。
     *   @note 整体流程：接收创建咖啡的DTO -> 处理flavors字符串数组 -> 生成Coffee实体 -> 保存Coffee以及它的口味关联
     */
    async create(createCoffeeDto:CreateCoffeeDto){
        //将DTO中的口味字符串转换成Flavor实体数组
        /**
         *   假设前端传来：
         *   {
         *       name:'Cappuccino',
         *       brand:'Nest',
         *       flavors:['milk','chocolate']
         *   }
         * 
         *   这里的flavors原本只是字符串数组，但数据库关系需要的是Flavor实体对象，所以这里会逐个调用：
         *       this.preloadFlavorByName('milk')
         *       this.preloadFlavorByName('chocolate')
         * 
         *   Promise.all()的作用是并发等待所有异步查询完成，最终得到：
         *   [
         *       Flavor {name:'milk'}
         *       Flavor {name:'chocolate'}
         *   ]
         */
        const flavors=await Promise.all(
            createCoffeeDto.flavors.map(name => this.preloadFlavorByName(name))
        );

        //创建Coffee实体对象
        /**
         *   将DTO转成TypeORM的Coffee实体实例
         *   ...createCoffeeDto先展开原始字段
         *   然后再用后面的flavors覆盖DTO中原本的字符串数组flavors，换成真正的Flavor[]实体数组
         * 
         *   本质是：DTO数据+处理好的Flavor实体数组->Coffee实体对象
         */
        const coffee=this.coffeeRepository.create({
            ...createCoffeeDto,
            flavors,
        });    //DTO -> Entity实例

        //保存到数据库
        /**
         *  如果Coffee和Flavor关系中配置了cascade:true，那么：
         *      - Coffee会被保存到coffee表
         *      - 新的Flavor会被保存到flavor表
         *      - Coffee和Flavor的关联会被保存到中间表
         */
        return this.coffeeRepository.save(coffee);                     //insert入库
    }

    /**
     * @function update
     * @param id 
     * @param updateCoffeeDto 
     * @description 根据id更新一条Coffee记录，并且在更新时处理flavors关联关系
     */
    async update(id:string,updateCoffeeDto:UpdateCoffeeDto){
        //preload：先按id从库里查，再用传入的字段覆盖，返回合并后的实体
        //如果传了flavors，先把字符串数组转成Flavor[]实体数组
        const flavors=updateCoffeeDto.flavors&&(await Promise.all(
            updateCoffeeDto.flavors.map(name => this.preloadFlavorByName(name))
        ));

        //用preload根据id查旧数据，并合并新字段
        /**
         *  preload()的作用是：
         *      先按id去数据库找已有Coffee。
         *      如果找到了，就把updateCoffeeDto里的字段覆盖上去，返回一个合并后的实体。
         *      如果没找到，返回undefined。
         */
        const coffee=updateCoffeeDto.flavors&&(await this.coffeeRepository.preload({
            id:+id,
            ...updateCoffeeDto,
            flavors
        }));

        //如果没找到Coffee，抛出404
        if(!coffee){
            throw new NotFoundException(`Coffee #${id} not found`);
        }

        //保存更新后的Coffee
        /**
         *  save()会根据实体里有没有主键判断是更新还是新增。
         *  这里有id，所以是更新。
         */
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

    /**
     * @function preloadFlavorByName
     * @param {string} name 
     * @returns {Promise<Flavor>} 
     * @description 按名称预加载/准备Flavor实体的辅助方法，主要用在创建或更新Coffee时处理口味关联。
     */
    private async preloadFlavorByName(name:string):Promise<Flavor>{
        //先去数据库查有没有同名的Flavor
        const existingFlavor=await this.flavorRepository.findOne({
            where: { name },
        });
        //如果找到了，直接复用已有的Flavor
        if(existingFlavor){
            return existingFlavor;
        }
        //如果没找到，就创建一个新的Flavor实体对象
        /**
         * 注意：
         *   这里的create()只是创建实体对象，并没有立刻写入数据库。
         *   真正保存通常是在后面保存Coffee的时候，通过级联cascade一起保存。   
         */
        return this.flavorRepository.create({name});
    }
}

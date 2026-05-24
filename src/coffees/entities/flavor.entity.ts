import {Column,Entity,PrimaryGeneratedColumn,ManyToMany} from "typeorm";
import { Coffee } from "./coffees.entity";

@Entity()
export class Flavor {
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    name:string;

    //Coffee是这层关系的所有者，因此不必再采用@JoinTable装饰器
    //最终将得到表名：coffee_flavors_flavor
    /**
     * Coffee -> coffee
     * 关系属性 flavors -> flavors
     * Flavor -> flavor
     * TypeORM 默认策略通常只是把类名做规范化处理，比如转成小写/蛇形，不负责英语单复数推断
     */
    @ManyToMany(type=>Coffee,coffee=>coffee.flavors)
    coffees:Coffee[];
}

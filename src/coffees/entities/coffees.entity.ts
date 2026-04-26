import { Entity ,PrimaryGeneratedColumn,Column,JoinTable, ManyToMany} from "typeorm";
import {Flavor} from './flavor.entity'

//咖啡实体类，用于定义咖啡的结构
@Entity()
export class Coffee{
    @ PrimaryGeneratedColumn()
    id:number;

    @Column()
    name:string;

    @Column()
    brand:string;

    @JoinTable()
    @ManyToMany(type=>Flavor,flavor=>flavor.coffees)
    flavors:string[]
}
import {Column,Entity,PrimaryGeneratedColumn,ManyToMany} from "typeorm";
import { Coffee } from "./coffees.entity";

@Entity()
export class Flavor {
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    name:string;

    //Coffee是这层关系的所有者，因此不必再采用@JoinTable装饰器
    @ManyToMany(type=>Coffee,coffee=>coffee.flavors)
    coffees:Coffee[];
}

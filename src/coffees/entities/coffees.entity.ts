import { Entity ,PrimaryGeneratedColumn,Column} from "typeorm";

//咖啡实体类，用于定义咖啡的结构
@Entity()
export class Coffee{
    @ PrimaryGeneratedColumn()
    id:number;

    @Column()
    name:string;

    @Column()
    brand:string;

    @Column('json',{nullable:true})       //表明是可选的
    flavors:string[]
}
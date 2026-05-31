import {Entity,PrimaryGeneratedColumn,Column,Index} from "typeorm";

//用于一个索引记录多列
@Index(['name','type'])
@Entity()
export class Event {
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    type:string;

    @Index()
    @Column()
    name:string;

    @Column('json')
    payload:Record<string,any>
}

import {IsString} from "class-validator";

export class CreateCoffeeDto {
    @IsString()
    readonly name:string;

    @IsString()
    readonly brand:string;

    @IsString({each:true})        //期望值是一个字符串数组
    readonly flavors:string[];
}

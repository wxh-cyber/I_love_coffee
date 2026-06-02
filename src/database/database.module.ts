import { DynamicModule, Module } from '@nestjs/common';
//新版已弃用createConnection
//import { createConnection } from 'typeorm';
import {  DataSource, DataSourceOptions } from 'typeorm';

export class DatabaseModule {
    //新版从ConnectOptions换成DataSourceOptions
    static register(options:DataSourceOptions):DynamicModule{
        return {
            module:DatabaseModule,
            providers:[
                {
                    provide:'CONNECTION',
                    useValue:new DataSource(options)
                }
            ]
        }
    }
}

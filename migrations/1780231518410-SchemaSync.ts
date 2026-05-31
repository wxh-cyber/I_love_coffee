import { MigrationInterface, QueryRunner } from "typeorm";

//让数据库表结构与当前实体类定义同步
export class SchemaSync1780231518410 implements MigrationInterface {
    name = 'SchemaSync1780231518410'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "coffee" ADD "description" character varying`);
        await queryRunner.query(`CREATE INDEX "IDX_b535fbe8ec6d832dde22065ebd" ON "event" ("name") `);
        await queryRunner.query(`CREATE INDEX "IDX_6e1de41532ad6af403d3ceb4f2" ON "event" ("name", "type") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_6e1de41532ad6af403d3ceb4f2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b535fbe8ec6d832dde22065ebd"`);
        await queryRunner.query(`ALTER TABLE "coffee" DROP COLUMN "description"`);
    }

}

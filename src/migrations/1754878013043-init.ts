import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1754878013043 implements MigrationInterface {
    name = 'Init1754878013043'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."attribute_type_enum" AS ENUM('text', 'number', 'date', 'boolean')`);
        await queryRunner.query(`CREATE TYPE "public"."attribute_matchtype_enum" AS ENUM('exact_match', 'partial_match', 'range_match')`);
        await queryRunner.query(`CREATE TABLE "attribute" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "code" character varying(100) NOT NULL, "type" "public"."attribute_type_enum" NOT NULL, "matchType" "public"."attribute_matchtype_enum" NOT NULL, "animeId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_3c3dadeb70707dfe5a6b3fd7f85" UNIQUE ("code"), CONSTRAINT "PK_b13fb7c5c9e9dff62b60e0de729" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "character" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "imageUrl" character varying(500), "attributes" json NOT NULL, "animeId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6c4aec48c564968be15078b8ae5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."anime_status_enum" AS ENUM('active', 'inactive')`);
        await queryRunner.query(`CREATE TABLE "anime" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "imageUrl" character varying(500), "status" "public"."anime_status_enum" NOT NULL DEFAULT 'active', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6e567f73ed63fd388a7734cbdd3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "attribute" ADD CONSTRAINT "FK_ff7ec259bf1a6e969bfeb57f43a" FOREIGN KEY ("animeId") REFERENCES "anime"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "character" ADD CONSTRAINT "FK_7ff0446685e18408b94fdd8b81f" FOREIGN KEY ("animeId") REFERENCES "anime"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "character" DROP CONSTRAINT "FK_7ff0446685e18408b94fdd8b81f"`);
        await queryRunner.query(`ALTER TABLE "attribute" DROP CONSTRAINT "FK_ff7ec259bf1a6e969bfeb57f43a"`);
        await queryRunner.query(`DROP TABLE "anime"`);
        await queryRunner.query(`DROP TYPE "public"."anime_status_enum"`);
        await queryRunner.query(`DROP TABLE "character"`);
        await queryRunner.query(`DROP TABLE "attribute"`);
        await queryRunner.query(`DROP TYPE "public"."attribute_matchtype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."attribute_type_enum"`);
    }

}

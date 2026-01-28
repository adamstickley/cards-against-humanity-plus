import { MigrationInterface, QueryRunner } from 'typeorm';

export class init1649147195343 implements MigrationInterface {
  name = 'init1649147195343';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "cah_card_sets" (
                "card_set_id" SERIAL NOT NULL,
                "title" character varying(300) NOT NULL,
                "recommended" boolean NOT NULL DEFAULT false,
                "is_base_set" boolean NOT NULL DEFAULT false,
                "popularity" integer NOT NULL DEFAULT '0',
                CONSTRAINT "PK_11a2addb3b15a26d65644f0e48e" PRIMARY KEY ("card_set_id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "cah_cards" (
                "card_id" SERIAL NOT NULL,
                "card_text" character varying(500) NOT NULL,
                "card_type" character varying NOT NULL,
                "draw" integer,
                "pick" integer,
                "card_set_id" integer,
                CONSTRAINT "PK_6c78ccd35134f0dc895b0a0c900" PRIMARY KEY ("card_id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "games" (
                "game_id" SERIAL NOT NULL,
                "slug" character varying(100) NOT NULL,
                "name" character varying(200) NOT NULL,
                "description" character varying,
                "image" character varying,
                "active" boolean NOT NULL DEFAULT false,
                CONSTRAINT "UQ_095bbaa4f028fa5a03e37f631d6" UNIQUE ("slug"),
                CONSTRAINT "PK_00f32d6507b00b23b8cd327fba7" PRIMARY KEY ("game_id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "cah_cards"
            ADD CONSTRAINT "FK_11f0a3673f21d79bfa305457c4e" FOREIGN KEY ("card_set_id") REFERENCES "cah_card_sets"("card_set_id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "cah_cards" DROP CONSTRAINT "FK_11f0a3673f21d79bfa305457c4e"
        `);
    await queryRunner.query(`
            DROP TABLE "games"
        `);
    await queryRunner.query(`
            DROP TABLE "cah_cards"
        `);
    await queryRunner.query(`
            DROP TABLE "cah_card_sets"
        `);
  }
}

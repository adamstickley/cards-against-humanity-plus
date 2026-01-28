import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGameSessionTables1706451200000 implements MigrationInterface {
  name = 'AddGameSessionTables1706451200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create game sessions table
    await queryRunner.query(`
      CREATE TABLE "cah_game_sessions" (
        "session_id" SERIAL NOT NULL,
        "code" character varying(8) NOT NULL,
        "status" character varying NOT NULL DEFAULT 'waiting',
        "current_round" integer NOT NULL DEFAULT 0,
        "score_to_win" integer NOT NULL DEFAULT 8,
        "max_players" integer NOT NULL DEFAULT 10,
        "cards_per_hand" integer NOT NULL DEFAULT 10,
        "round_timer_seconds" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_cah_game_sessions_code" UNIQUE ("code"),
        CONSTRAINT "PK_cah_game_sessions" PRIMARY KEY ("session_id")
      )
    `);

    // Create session players table
    await queryRunner.query(`
      CREATE TABLE "cah_session_players" (
        "session_player_id" SERIAL NOT NULL,
        "session_id" integer NOT NULL,
        "user_id" character varying(100),
        "nickname" character varying(50) NOT NULL,
        "score" integer NOT NULL DEFAULT 0,
        "is_host" boolean NOT NULL DEFAULT false,
        "is_connected" boolean NOT NULL DEFAULT true,
        "joined_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_cah_session_players" PRIMARY KEY ("session_player_id")
      )
    `);

    // Create session card packs table
    await queryRunner.query(`
      CREATE TABLE "cah_session_card_packs" (
        "session_card_pack_id" SERIAL NOT NULL,
        "session_id" integer NOT NULL,
        "card_set_id" integer NOT NULL,
        CONSTRAINT "PK_cah_session_card_packs" PRIMARY KEY ("session_card_pack_id")
      )
    `);

    // Create player hands table
    await queryRunner.query(`
      CREATE TABLE "cah_player_hands" (
        "player_hand_id" SERIAL NOT NULL,
        "session_player_id" integer NOT NULL,
        "card_id" integer NOT NULL,
        CONSTRAINT "PK_cah_player_hands" PRIMARY KEY ("player_hand_id")
      )
    `);

    // Create game rounds table
    await queryRunner.query(`
      CREATE TABLE "cah_game_rounds" (
        "round_id" SERIAL NOT NULL,
        "session_id" integer NOT NULL,
        "round_number" integer NOT NULL,
        "prompt_card_id" integer NOT NULL,
        "judge_player_id" integer NOT NULL,
        "status" character varying NOT NULL DEFAULT 'submissions',
        "winner_player_id" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_cah_game_rounds" PRIMARY KEY ("round_id")
      )
    `);

    // Create round submissions table
    await queryRunner.query(`
      CREATE TABLE "cah_round_submissions" (
        "submission_id" SERIAL NOT NULL,
        "round_id" integer NOT NULL,
        "session_player_id" integer NOT NULL,
        "submitted_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_cah_round_submissions" PRIMARY KEY ("submission_id")
      )
    `);

    // Create submission cards table
    await queryRunner.query(`
      CREATE TABLE "cah_submission_cards" (
        "submission_card_id" SERIAL NOT NULL,
        "submission_id" integer NOT NULL,
        "card_id" integer NOT NULL,
        "card_order" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_cah_submission_cards" PRIMARY KEY ("submission_card_id")
      )
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "cah_session_players"
      ADD CONSTRAINT "FK_cah_session_players_session"
      FOREIGN KEY ("session_id") REFERENCES "cah_game_sessions"("session_id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "cah_session_card_packs"
      ADD CONSTRAINT "FK_cah_session_card_packs_session"
      FOREIGN KEY ("session_id") REFERENCES "cah_game_sessions"("session_id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "cah_session_card_packs"
      ADD CONSTRAINT "FK_cah_session_card_packs_card_set"
      FOREIGN KEY ("card_set_id") REFERENCES "cah_card_sets"("card_set_id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "cah_player_hands"
      ADD CONSTRAINT "FK_cah_player_hands_player"
      FOREIGN KEY ("session_player_id") REFERENCES "cah_session_players"("session_player_id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "cah_player_hands"
      ADD CONSTRAINT "FK_cah_player_hands_card"
      FOREIGN KEY ("card_id") REFERENCES "cah_cards"("card_id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "cah_game_rounds"
      ADD CONSTRAINT "FK_cah_game_rounds_session"
      FOREIGN KEY ("session_id") REFERENCES "cah_game_sessions"("session_id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "cah_game_rounds"
      ADD CONSTRAINT "FK_cah_game_rounds_prompt_card"
      FOREIGN KEY ("prompt_card_id") REFERENCES "cah_cards"("card_id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "cah_game_rounds"
      ADD CONSTRAINT "FK_cah_game_rounds_judge"
      FOREIGN KEY ("judge_player_id") REFERENCES "cah_session_players"("session_player_id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "cah_game_rounds"
      ADD CONSTRAINT "FK_cah_game_rounds_winner"
      FOREIGN KEY ("winner_player_id") REFERENCES "cah_session_players"("session_player_id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "cah_round_submissions"
      ADD CONSTRAINT "FK_cah_round_submissions_round"
      FOREIGN KEY ("round_id") REFERENCES "cah_game_rounds"("round_id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "cah_round_submissions"
      ADD CONSTRAINT "FK_cah_round_submissions_player"
      FOREIGN KEY ("session_player_id") REFERENCES "cah_session_players"("session_player_id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "cah_submission_cards"
      ADD CONSTRAINT "FK_cah_submission_cards_submission"
      FOREIGN KEY ("submission_id") REFERENCES "cah_round_submissions"("submission_id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "cah_submission_cards"
      ADD CONSTRAINT "FK_cah_submission_cards_card"
      FOREIGN KEY ("card_id") REFERENCES "cah_cards"("card_id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // Create indexes for better query performance
    await queryRunner.query(`
      CREATE INDEX "IDX_cah_session_players_session" ON "cah_session_players" ("session_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_cah_session_card_packs_session" ON "cah_session_card_packs" ("session_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_cah_player_hands_player" ON "cah_player_hands" ("session_player_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_cah_game_rounds_session" ON "cah_game_rounds" ("session_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_cah_round_submissions_round" ON "cah_round_submissions" ("round_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_cah_round_submissions_round"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_cah_game_rounds_session"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_cah_player_hands_player"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_cah_session_card_packs_session"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_cah_session_players_session"`,
    );

    // Drop foreign key constraints and tables in reverse order
    await queryRunner.query(`DROP TABLE IF EXISTS "cah_submission_cards"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "cah_round_submissions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "cah_game_rounds"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "cah_player_hands"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "cah_session_card_packs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "cah_session_players"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "cah_game_sessions"`);
  }
}

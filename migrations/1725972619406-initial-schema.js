const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class InitialSchema1725972619406 {
    name = 'InitialSchema1725972619406'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."task_priority_enum" AS ENUM('low', 'medium', 'high')`);
        await queryRunner.query(`CREATE TYPE "public"."task_state_enum" AS ENUM('todo', 'in_progress', 'done')`);
        await queryRunner.query(`CREATE TABLE "task" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" character varying NOT NULL, "priority" "public"."task_priority_enum" NOT NULL, "state" "public"."task_state_enum" NOT NULL DEFAULT 'todo', "assigned_to" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "done_at" TIMESTAMP, CONSTRAINT "PK_fb213f79ee45060ba925ecd576e" PRIMARY KEY ("id"))`);
    }

    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "task"`);
        await queryRunner.query(`DROP TYPE "public"."task_state_enum"`);
        await queryRunner.query(`DROP TYPE "public"."task_priority_enum"`);
    }
}

const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class InitialSchema1726194180391 {
    name = 'InitialSchema1726194180391'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."task_state_enum" AS ENUM('todo', 'in_progress', 'done', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "task" ("id" SERIAL NOT NULL, "title" character varying(35) NOT NULL, "description" character varying(150) NOT NULL, "priority" integer NOT NULL, "state" "public"."task_state_enum" NOT NULL DEFAULT 'todo', "assigned_user_id" integer, "assigned_at" TIMESTAMP WITH TIME ZONE, "progress_started_at" TIMESTAMP WITH TIME ZONE, "done_at" TIMESTAMP WITH TIME ZONE, "cancelled_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_fb213f79ee45060ba925ecd576e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`
            INSERT INTO "task" 
            ("title", "description", "priority", "state", "assigned_user_id", "assigned_at", "progress_started_at", "done_at", "cancelled_at", "created_at", "updated_at")
            VALUES
            ('Task 1', 'Description 1', 1, 'todo', 2, '2024-09-13 09:00:00+00', NULL, NULL, NULL, '2024-09-13 08:30:00+00', '2024-09-13 08:30:00+00'),            
            ('Task 2', 'Description 2', 2, 'in_progress', 3, '2024-09-12 10:00:00+00', '2024-09-13 12:00:00+00', NULL, NULL, '2024-09-12 08:00:00+00', '2024-09-13 12:00:00+00'),            
            ('Task 3', 'Description 3', 3, 'done', 1, '2024-09-10 11:00:00+00', '2024-09-11 13:00:00+00', '2024-09-12 14:00:00+00', NULL, '2024-09-10 08:00:00+00', '2024-09-12 14:00:00+00'),            
            ('Task 4', 'Description 4', 2, 'cancelled', 4, '2024-09-11 10:00:00+00', '2024-09-12 09:00:00+00', NULL, '2024-09-13 15:00:00+00', '2024-09-11 08:00:00+00', '2024-09-13 15:00:00+00'),            
            ('Task 5', 'Description 5', 1, 'in_progress', 2, '2024-09-12 09:00:00+00', '2024-09-13 11:30:00+00', NULL, NULL, '2024-09-12 07:00:00+00', '2024-09-13 11:30:00+00'),            
            ('Task 6', 'Description 6', 3, 'done', 1, '2024-09-09 10:00:00+00', '2024-09-09 11:30:00+00', '2024-09-10 12:00:00+00', NULL, '2024-09-09 08:00:00+00', '2024-09-10 12:00:00+00'),            
            ('Task 7', 'Description 7', 1, 'cancelled', 3, '2024-09-08 12:00:00+00', '2024-09-09 14:30:00+00', NULL, '2024-09-11 16:00:00+00', '2024-09-08 09:00:00+00', '2024-09-11 16:00:00+00'),            
            ('Task 8', 'Description 8', 2, 'todo', 5, '2024-09-14 10:00:00+00', NULL, NULL, NULL, '2024-09-14 08:30:00+00', '2024-09-14 08:30:00+00'),            
            ('Task 9', 'Description 9', 1, 'in_progress', 6, '2024-09-05 08:00:00+00', '2024-09-08 13:00:00+00', NULL, NULL, '2024-09-05 07:00:00+00', '2024-09-08 13:00:00+00'),            
            ('Task 10', 'Description 10', 3, 'cancelled', 7, '2024-09-04 09:00:00+00', '2024-09-05 14:00:00+00', NULL, '2024-09-06 15:00:00+00', '2024-09-04 08:00:00+00', '2024-09-06 15:00:00+00'),            
            ('Task 11', 'Description 11', 2, 'done', 8, '2024-09-01 09:30:00+00', '2024-09-01 12:00:00+00', '2024-09-02 13:00:00+00', NULL, '2024-09-01 08:00:00+00', '2024-09-02 13:00:00+00'),            
            ('Task 12', 'Description 12', 3, 'in_progress', 9, '2024-09-13 07:30:00+00', '2024-09-13 09:00:00+00', NULL, NULL, '2024-09-13 06:30:00+00', '2024-09-13 09:00:00+00'),            
            ('Task 13', 'Description 13', 1, 'todo', 10, '2024-09-13 08:00:00+00', NULL, NULL, NULL, '2024-09-13 07:30:00+00', '2024-09-13 07:30:00+00'),            
            ('Task 14', 'Description 14', 2, 'cancelled', 11, '2024-09-12 09:00:00+00', '2024-09-12 11:00:00+00', NULL, '2024-09-13 12:00:00+00', '2024-09-12 08:00:00+00', '2024-09-13 12:00:00+00'),            
            ('Task 15', 'Description 15', 3, 'done', 12, '2024-09-10 11:00:00+00', '2024-09-11 10:30:00+00', '2024-09-12 13:00:00+00', NULL, '2024-09-10 09:00:00+00', '2024-09-12 13:00:00+00');
          `);
          
    }

    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "task"`);
        await queryRunner.query(`DROP TYPE "public"."task_state_enum"`);
    }
}

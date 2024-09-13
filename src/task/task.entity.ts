import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TaskState } from "./constants/enums";

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 35 })
  title: string;

  @Column({ length: 150 })//Test
  description: string;

  @Column()
  priority: number;

  @Column({
    type: 'enum',
    enum: TaskState,
    default: TaskState.TODO
  })
  state: TaskState;

  @Column({ nullable: true })
  assigned_user_id: number;

  @Column({ type: 'timestamptz', nullable: true })
  assigned_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  progress_started_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  done_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  cancelled_at: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
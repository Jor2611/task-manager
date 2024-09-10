import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TaskPriority, TaskState } from "./constants/enums";

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;
//Add min max lengths
  @Column()
  title: string;

  @Column()
  description: string;

  @Column({
    type: 'enum',
    enum: TaskPriority
  })
  priority: TaskPriority;

  @Column({
    type: 'enum',
    enum: TaskState,
    default: TaskState.TODO
  })
  state: TaskState;

  @Column({ nullable: true })
  assigned_to: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  updated_at: Date;

  @Column({ nullable: true })
  done_at: Date;  
}
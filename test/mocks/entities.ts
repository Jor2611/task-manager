import { TaskPriority, TaskState } from "../../src/task/constants/enums";

interface ITaskMock {
  id: number;
  fakeId: number;
  member_id: number;
  title: string;
  updatedTitle: string;
  description: string;
  updatedDescription: string;
  priority: TaskPriority;
  updatedPriority: TaskPriority;
  state: TaskState;
  assign_to: string;
  assigned_to?: string;
  created_at: Date;
  updated_at?: Date;
  done_at?: Date;
}

export const TaskMock: ITaskMock = {
  id: 1,
  fakeId: 123456789, 
  member_id: 1,
  title:'Task Title',
  updatedTitle: 'Task Title Updated',
  description:'Task Description',
  updatedDescription: 'Task Description Updated',
  priority: TaskPriority.LOW,
  updatedPriority: TaskPriority.HIGH, 
  state: TaskState.TODO,
  created_at: new Date(),
  assign_to: 'John Doe'
};
import { Task } from "../../src/task/task.entity";
import { TaskState } from "../../src/task/constants/enums";

interface ITaskMock {
  id: number;
  fakeId: number;
  member_id: number;
  title: string;
  updatedTitle: string;
  description: string;
  updatedDescription: string;
  priority: number;
  updatedPriority: number;
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
  priority: 1,
  updatedPriority: 3, 
  state: TaskState.TODO,
  created_at: new Date(),
  assign_to: 'John Doe'
};

interface GenerateTasksOptions {
  length: number;
  priority?: number | null;
  state?: TaskState | null;
  owner?: string | null;
}

export const generateTasks = (opts: GenerateTasksOptions): Task[] => {
  const { length, priority, state, owner } = opts;
  const taskCollection: Task[] = [];

  for (let i = 0; i < length; i++) {
    const task = new Task();
    task.id = i + 1;
    task.title = `Task ${i + 1}`;
    task.description = `Description for Task ${i + 1}`;
    task.priority = priority || Math.floor(Math.random() * 3) + 1;
    task.state = state || TaskState.TODO;
    task.assigned_to = owner || null;
    task.created_at = new Date();
    task.updated_at = new Date();
    taskCollection.push(task);
  }

  return taskCollection;
}
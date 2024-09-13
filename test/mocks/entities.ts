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
  assign_to: number;
  assigned_to?: number;
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
  assign_to: 15
};

interface GenerateTasksOptions {
  length: number;
  priority?: number | null;
  state?: TaskState | null;
  owner?: number | null;
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
    task.assigned_user_id = owner || null;
    task.created_at = new Date();
    task.updated_at = new Date();
    taskCollection.push(task);
  }

  return taskCollection;
}

export const taskSeedData = [
  { title: 'Task 1', description: 'Description 1', priority: 1, state: 'todo', assigned_user_id: 2, assigned_at: '2024-09-13 09:00:00+00', progress_started_at: null, done_at: null, cancelled_at: null, created_at: '2024-09-13 08:30:00+00', updated_at: '2024-09-13 08:30:00+00' },
  { title: 'Task 2', description: 'Description 2', priority: 2, state: 'in_progress', assigned_user_id: 3, assigned_at: '2024-09-12 10:00:00+00', progress_started_at: '2024-09-13 12:00:00+00', done_at: null, cancelled_at: null, created_at: '2024-09-12 08:00:00+00', updated_at: '2024-09-13 12:00:00+00' },
  { title: 'Task 3', description: 'Description 3', priority: 3, state: 'done', assigned_user_id: 1, assigned_at: '2024-09-10 11:00:00+00', progress_started_at: '2024-09-11 13:00:00+00', done_at: '2024-09-12 14:00:00+00', cancelled_at: null, created_at: '2024-09-10 08:00:00+00', updated_at: '2024-09-12 14:00:00+00' },
  { title: 'Task 4', description: 'Description 4', priority: 2, state: 'cancelled', assigned_user_id: 4, assigned_at: '2024-09-11 10:00:00+00', progress_started_at: '2024-09-12 09:00:00+00', done_at: null, cancelled_at: '2024-09-13 15:00:00+00', created_at: '2024-09-11 08:00:00+00', updated_at: '2024-09-13 15:00:00+00' },
  { title: 'Task 5', description: 'Description 5', priority: 1, state: 'in_progress', assigned_user_id: 2, assigned_at: '2024-09-12 09:00:00+00', progress_started_at: '2024-09-13 11:30:00+00', done_at: null, cancelled_at: null, created_at: '2024-09-12 07:00:00+00', updated_at: '2024-09-13 11:30:00+00' },
  { title: 'Task 6', description: 'Description 6', priority: 3, state: 'done', assigned_user_id: 1, assigned_at: '2024-09-09 10:00:00+00', progress_started_at: '2024-09-09 11:30:00+00', done_at: '2024-09-10 12:00:00+00', cancelled_at: null, created_at: '2024-09-09 08:00:00+00', updated_at: '2024-09-10 12:00:00+00' },
  { title: 'Task 7', description: 'Description 7', priority: 1, state: 'cancelled', assigned_user_id: 3, assigned_at: '2024-09-08 12:00:00+00', progress_started_at: '2024-09-09 14:30:00+00', done_at: null, cancelled_at: '2024-09-11 16:00:00+00', created_at: '2024-09-08 09:00:00+00', updated_at: '2024-09-11 16:00:00+00' },
  { title: 'Task 8', description: 'Description 8', priority: 2, state: 'todo', assigned_user_id: 5, assigned_at: '2024-09-14 10:00:00+00', progress_started_at: null, done_at: null, cancelled_at: null, created_at: '2024-09-14 08:30:00+00', updated_at: '2024-09-14 08:30:00+00' },
  { title: 'Task 9', description: 'Description 9', priority: 1, state: 'in_progress', assigned_user_id: 6, assigned_at: '2024-09-05 08:00:00+00', progress_started_at: '2024-09-08 13:00:00+00', done_at: null, cancelled_at: null, created_at: '2024-09-05 07:00:00+00', updated_at: '2024-09-08 13:00:00+00' },
  { title: 'Task 10', description: 'Description 10', priority: 3, state: 'cancelled', assigned_user_id: 7, assigned_at: '2024-09-04 09:00:00+00', progress_started_at: '2024-09-05 14:00:00+00', done_at: null, cancelled_at: '2024-09-06 15:00:00+00', created_at: '2024-09-04 08:00:00+00', updated_at: '2024-09-06 15:00:00+00' },
  { title: 'Task 11', description: 'Description 11', priority: 2, state: 'done', assigned_user_id: 8, assigned_at: '2024-09-01 09:30:00+00', progress_started_at: '2024-09-01 12:00:00+00', done_at: '2024-09-02 13:00:00+00', cancelled_at: null, created_at: '2024-09-01 08:00:00+00', updated_at: '2024-09-02 13:00:00+00' },
  { title: 'Task 12', description: 'Description 12', priority: 3, state: 'in_progress', assigned_user_id: 9, assigned_at: '2024-09-13 07:30:00+00', progress_started_at: '2024-09-13 09:00:00+00', done_at: null, cancelled_at: null, created_at: '2024-09-13 06:30:00+00', updated_at: '2024-09-13 09:00:00+00' },
  { title: 'Task 13', description: 'Description 13', priority: 1, state: 'todo', assigned_user_id: 10, assigned_at: '2024-09-13 08:00:00+00', progress_started_at: null, done_at: null, cancelled_at: null, created_at: '2024-09-13 07:30:00+00', updated_at: '2024-09-13 07:30:00+00' },
  { title: 'Task 14', description: 'Description 14', priority: 2, state: 'cancelled', assigned_user_id: 11, assigned_at: '2024-09-12 09:00:00+00', progress_started_at: '2024-09-12 11:00:00+00', done_at: null, cancelled_at: '2024-09-13 12:00:00+00', created_at: '2024-09-12 08:00:00+00', updated_at: '2024-09-13 12:00:00+00' },
  { title: 'Task 15', description: 'Description 15', priority: 3, state: 'done', assigned_user_id: 12, assigned_at: '2024-09-10 11:00:00+00', progress_started_at: '2024-09-11 10:30:00+00', done_at: '2024-09-12 13:00:00+00', cancelled_at: null, created_at: '2024-09-10 09:00:00+00', updated_at: '2024-09-12 13:00:00+00' }
];
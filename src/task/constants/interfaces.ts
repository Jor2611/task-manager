import { TaskPriority } from "./enums";

export interface ICreateTask {
  title: string;
  description: string;
  priority: TaskPriority;
  assign_to?: string;
}
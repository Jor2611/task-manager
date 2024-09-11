import { TaskState } from "./enums";

export interface ICreateTask {
  title: string;
  description: string;
  priority: number;
  assign_to?: string;
}

export interface ITaskFilter {
  page: number;
  limit: number;
  state?: TaskState;
  priority?: number;
  owner?: string;
  sortBy?: 'id' | 'priority';
  sortOrder?: 'asc' | 'desc';
}
import { TaskState } from "./enums";

export interface ICreateTask {
  title: string;
  description: string;
  priority: number;
  assign_to?: number;
}

export interface ITaskFilter {
  page: number;
  limit: number;
  state?: TaskState;
  priority?: number;
  owner?: number;
  sortBy?: 'id' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

export interface IUpdateTask {
  title?: string;
  description?: string;
  priority?: number;
  assigned_user_id?: number;
  state?: TaskState;
}


export interface IGenerateReport {
  user_id?: number;
  period_from?: string;
  period_to?: string;
}
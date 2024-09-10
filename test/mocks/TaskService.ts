import { ICreateTask } from "../../src/task/constants/interfaces";
import { TaskState } from "../../src/task/constants/enums";
import { Task } from "../../src/task/task.entity";

export class TaskServiceMock {
  private _tasks: Task[] = [];
  constructor(){}

  get tasks(){
    return this._tasks;
  }

  async create(data: ICreateTask){
    const { title, description, priority, assign_to } = data;
    const id = this._tasks.length + 1;
    const task = {  
      id,
      title,
      description,
      priority,
      state: TaskState.TODO,
      assigned_to:  assign_to || null,
      created_at: new Date(),
      updated_at: new Date(),
      done_at: null
    } as Task;
    this._tasks.push(task);
    return task;
  }

  resetData(){
    this._tasks = [];
  }
}
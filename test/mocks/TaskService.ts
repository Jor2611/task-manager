import { ICreateTask, ITaskFilter } from "../../src/task/constants/interfaces";
import { TaskState } from "../../src/task/constants/enums";
import { Task } from "../../src/task/task.entity";
import { NotFoundException } from "@nestjs/common";

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

  async read(id: number){
    const task = this._tasks.find((_task: Task) => _task.id === id);
    if(!task) throw new NotFoundException('TASK_NOT_FOUND');
    return task;
  }

  //Doesn't make sense to add filters functionlities
  async filter(data: ITaskFilter){
    if(!this._tasks.length) return this.tasks;

    const { page, limit, sortBy, sortOrder } = data;
    let skipTasks = (page - 1) * limit;
    let arr = this._tasks;
    
    if(sortBy && (sortBy in this._tasks[0]) && typeof this._tasks[0][sortBy] === 'number'){
      arr.sort((a: Task, b: Task) => {
        return sortOrder === 'desc' ? b[sortBy] - a[sortBy] : a[sortBy] - b[sortBy]; 
      })
    }
    
    return { tasks: arr.slice(skipTasks, skipTasks + limit), count: arr.length };
  }

  async seed(tasks: Task[]){
    this._tasks = tasks;
  }

  resetData(){
    this._tasks = [];
  }
}
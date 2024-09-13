import { ICreateTask, IGenerateReport, ITaskFilter, IUpdateTask } from "../../src/task/constants/interfaces";
import { TaskState } from "../../src/task/constants/enums";
import { Task } from "../../src/task/task.entity";
import { BadRequestException, NotFoundException } from "@nestjs/common";

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
      assigned_user_id:  assign_to || null,
      created_at: new Date(),
      updated_at: new Date(),
      done_at: null,
      cancelled_at: null,
      assigned_at: assign_to ? new Date() : null,
      progress_started_at: null
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

  async update(id: number, data: IUpdateTask) {
    const taskIndex = this._tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) {
      throw new NotFoundException('TASK_NOT_FOUND');
    }

    const task = this._tasks[taskIndex];
    const updatedTask = { ...task, ...data, updated_at: new Date() };

    if (data.state) {
      switch (task.state) {
        case TaskState.TODO:
        case TaskState.IN_PROGRESS:
          if (data.state === TaskState.DONE) {
            updatedTask.done_at = updatedTask.done_at || new Date();
          } else if (data.state === TaskState.CANCELLED) {
            updatedTask.cancelled_at = updatedTask.cancelled_at || new Date();
          } else if (data.state !== TaskState.IN_PROGRESS && data.state !== TaskState.TODO) {
            throw new BadRequestException('INVALID_STATE_TRANSITION');
          }
          break;
        case TaskState.DONE:
        case TaskState.CANCELLED:
          if (data.state !== task.state) {
            throw new BadRequestException('INVALID_STATE_TRANSITION');
          }
          break;
      }
    }

    if (data.assigned_user_id !== undefined && data.assigned_user_id !== task.assigned_user_id) {
      updatedTask.assigned_at = new Date();
    }

    this._tasks[taskIndex] = updatedTask;
    return updatedTask;
  }

  async remove(id: number) {
    const taskIndex = this._tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) {
      throw new NotFoundException('TASK_NOT_FOUND');
    }

    const removedTask = this._tasks.splice(taskIndex, 1)[0];
    return removedTask;
  }

  async generateReport(reportDto: IGenerateReport): Promise<any> {
    const { user_id, period_from, period_to } = reportDto;
    const startDate = period_from ? new Date(period_from) : new Date(0);
    const endDate = period_to ? new Date(period_to) : new Date();

    const filteredTasks = this._tasks.filter(task => {
      const createdAt = new Date(task.created_at);
      return createdAt >= startDate && createdAt <= endDate &&
             (!user_id || task.assigned_user_id === user_id);
    });

    const report = {
      total_tasks: filteredTasks.length,
      completed_tasks: filteredTasks.filter(task => task.state === TaskState.DONE).length,
      cancelled_tasks: filteredTasks.filter(task => task.state === TaskState.CANCELLED).length,
      in_progress_tasks: filteredTasks.filter(task => task.state === TaskState.IN_PROGRESS).length,
      todo_tasks: filteredTasks.filter(task => task.state === TaskState.TODO).length,
    };

    return report;
  }

  async seed(tasks: Task[]){
    this._tasks = tasks;
  }

  resetData(){
    this._tasks = [];
  }
}
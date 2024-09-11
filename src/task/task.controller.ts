import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { TaskService } from './task.service';
import { ListTasksDto } from './dtos/listTask.dto';
import { ReadTaskDto } from './dtos/readTask.dto';
import { CreateTaskDto } from './dtos/createTask.dto';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService){} 

  @Get()
  async list(@Query() query: ListTasksDto) {
    const result = await this.taskService.filter(query);
    return { msg: 'TASKS_FETCHED', data: result.tasks, totalCount: result.count };
  }

  @Get(':id')
  async read(@Param() params: ReadTaskDto) {
    const result = await this.taskService.read(params.id);
    return { msg: 'TASK_FETCHED', data: result };
  }

  @Post()
  async create(@Body() body: CreateTaskDto){
    const result = await this.taskService.create(body);
    return { msg: 'TASK_CREATED', data: result };
  }
}

import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dtos/createTask.dto';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService){} 

  @Get(':id')
  async read(@Param('id', new ParseIntPipe()) id: number){
    const result = await this.taskService.read(id);
    return { msg: 'TASK_FETCHED', data: result };
  }

  @Post()
  async create(@Body() body: CreateTaskDto){
    const result = await this.taskService.create(body);
    return { msg: 'TASK_CREATED', data: result };
  }
}

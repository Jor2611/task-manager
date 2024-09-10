import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dtos/createTask.dto';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService){}
  @Post()
  async create(@Body() body: CreateTaskDto){
    const result = await this.taskService.create(body);
    return { msg: 'TASK_CREATED', data: result };
  }
}

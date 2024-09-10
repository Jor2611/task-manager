import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { CreateTaskDto } from './dtos/createTask.dto';

@Controller('task')
export class TaskController {
  @Post()
  create(@Body() body: CreateTaskDto){
    console.log(body);
    return { data: body };
  }
}

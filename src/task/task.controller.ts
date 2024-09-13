import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import { TaskService } from './task.service';
import { ListTasksDto } from './dtos/listTask.dto';
import { ReadTaskDto } from './dtos/readTask.dto';
import { CreateTaskDto } from './dtos/createTask.dto';
import { UpdateTaskDto } from './dtos/updateTask.dto';
import { GenerateReportDto } from './dtos/generateReport.dto';

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

  @Post('report')
  @HttpCode(200)
  async generateReport(@Body() body: GenerateReportDto){
    const result = await this.taskService.generateReport(body);
    return { msg: 'REPORT_GENERATED', data: result };
  }

  @Patch(':id')
  async update(@Param() params: ReadTaskDto, @Body() body: UpdateTaskDto){
    const result = await this.taskService.update(params.id, body);
    return { msg: 'TASK_UPDATED', data: result };
  }

  @Delete(':id')
  async remove(@Param() params: ReadTaskDto){
    await this.taskService.remove(params.id);
    return { msg: 'TASK_DELETED', data: { id: params.id } };
  }
}

import { BadRequestException, Controller, Post } from '@nestjs/common';

@Controller('task')
export class TaskController {
  @Post()
  create(){
    throw new BadRequestException('WRONG DATA');
  }
}

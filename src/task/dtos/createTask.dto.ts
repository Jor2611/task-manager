import { BadRequestException } from '@nestjs/common';
import { IsString, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { TaskPriority } from '../constants/enums';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(TaskPriority)
  @Transform(({ value }) => {
    if (typeof value !== 'string') throw new BadRequestException('Priority must be a string');
    return value.toLowerCase();
  })
  priority: TaskPriority;
}
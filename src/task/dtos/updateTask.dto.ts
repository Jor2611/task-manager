import { IsString, IsOptional, IsInt, Min, Max, IsEnum, IsNumber } from 'class-validator';
import { TaskState } from '../constants/enums';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Min(1)
  @Max(3)
  @IsInt()
  @IsOptional()
  priority?: number;

  @IsInt()
  @IsNumber()
  @IsOptional()
  assigned_user_id?: number;

  @IsEnum(TaskState)
  @IsOptional()
  state?: TaskState;
}
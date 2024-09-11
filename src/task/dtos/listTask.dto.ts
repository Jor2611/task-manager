import { IsOptional, IsInt, Min, IsString, Max, IsEnum } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { TaskState } from '../constants/enums';

export class ListTasksDto {
  @Min(1)
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  page: number = 1;

  @Min(1)
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  limit: number = 10;

  @Min(1)
  @Max(3)
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  priority?: number;

  @IsString()
  @IsOptional()
  owner?: string;

  @IsEnum(TaskState)
  @IsOptional()
  state?: TaskState;

  @IsString()
  @IsOptional()
  sortBy?: 'id' | 'priority';

  @IsString()
  @IsOptional()
  @Transform(({ obj }) => obj.sortBy ? (obj.sortOrder.toLowerCase() || 'asc') : undefined)
  sortOrder?: 'asc' | 'desc';
}
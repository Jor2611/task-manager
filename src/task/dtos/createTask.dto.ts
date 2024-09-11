import { IsString, IsOptional, IsInt, Min, Max, IsNumber } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @Min(1)
  @Max(3)
  @IsInt()
  priority: number;

  @IsString()
  @IsOptional()
  assign_to?: string;
}
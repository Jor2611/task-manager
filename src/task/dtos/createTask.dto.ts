import { IsString, IsOptional, IsInt, Min, Max, IsNumber, MinLength, MaxLength } from 'class-validator';

export class CreateTaskDto {  
  @MinLength(2)
  @MaxLength(35)
  @IsString()
  title: string;

  @MinLength(10)
  @MaxLength(150)
  @IsString()
  description: string;

  @Min(1)
  @Max(3)
  @IsInt()
  priority: number;

  @IsNumber()
  @IsOptional()
  assign_to?: number;
}
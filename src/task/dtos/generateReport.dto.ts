import { Transform } from "class-transformer";
import { IsDateString, IsInt, IsOptional } from "class-validator";

export class GenerateReportDto {
  @IsInt()
  @IsOptional()
  user_id?: number;

  @IsDateString()
  @Transform(({ value }) => {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return value;
    }
    return date.toISOString().split('T')[0] + 'T00:00:00.000Z';
  })
  period_from: string = new Date(0).toISOString().split('T')[0] + 'T00:00:00.000Z';

  @IsDateString()
  @Transform(({ value }) => {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return value;
    }
    return date.toISOString().split('T')[0] + 'T23:59:59.999Z';
  })
  period_to: string = new Date().toISOString().split('T')[0] + 'T23:59:59.999Z';
}
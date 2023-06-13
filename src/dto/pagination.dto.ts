import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional } from 'class-validator';

export class PaginationDto {
  @ApiProperty({ default: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page: number = 0;

  @ApiProperty({ default: 20, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  pageSize: number = 20;
}

import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class QueryArticlesDto {
  // 分页参数
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'title']) // 允许排序的字段
  orderBy?: string = 'createdAt'; // 默认按创建时间排序

  @IsOptional()
  @IsIn(['ASC', 'DESC']) // 升序或降序
  order?: 'ASC' | 'DESC' = 'DESC'; // 默认降序
}

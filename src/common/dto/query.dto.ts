import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryDto {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number = 1;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit: number = 100;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    searchField?: string;

    @IsOptional()
    @IsString()
    sort?: string;

    @IsOptional()
    @IsString()
    order?: 'ASC' | 'DESC';

    @IsOptional()
    @IsString()
    withDeleted?: string;
}

import { PartialType } from '@nestjs/mapped-types';
import { CreateSaleDto, CreateSaleDetailDto } from './create-sale.dto';

export class UpdateSaleDto extends PartialType(CreateSaleDto) { }

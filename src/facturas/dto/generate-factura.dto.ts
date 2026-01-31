import { IsNumber } from 'class-validator';

export class GenerateFacturaDto {
    @IsNumber()
    saleId: number;
}

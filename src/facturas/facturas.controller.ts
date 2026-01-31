import { Controller, Get, Param, Res, Post, Body, UseGuards, HttpStatus, HttpException } from '@nestjs/common';
import { FacturasService } from './facturas.service';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GenerateFacturaDto } from './dto/generate-factura.dto';
import * as fs from 'fs';

@Controller('facturas')
export class FacturasController {
    constructor(private readonly facturasService: FacturasService) { }

    @Post('generate')
    @UseGuards(JwtAuthGuard)
    async generateFactura(@Body() generateFacturaDto: GenerateFacturaDto) {
        const fileName = await this.facturasService.generateFactura(generateFacturaDto.saleId);
        return {
            message: 'Factura generada exitosamente',
            fileName,
            downloadUrl: `/facturas/download/${generateFacturaDto.saleId}`,
        };
    }

    @Get('download/:saleId')
    @UseGuards(JwtAuthGuard)
    async downloadFactura(@Param('saleId') saleId: string, @Res() res: Response) {
        try {
            // Generate new factura
            const fileName = await this.facturasService.generateFactura(Number(saleId));
            const filePath = this.facturasService.getFacturaPath(fileName);

            // Check if file exists
            if (!fs.existsSync(filePath)) {
                throw new HttpException('Factura no encontrada', HttpStatus.NOT_FOUND);
            }

            // Send file
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=factura-${saleId}.pdf`);

            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);
        } catch (error) {
            throw new HttpException(
                error.message || 'Error al descargar la factura',
                error.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}

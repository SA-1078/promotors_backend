import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from '../sales/sale.entity';
import { MailService } from '../mail/mail.service';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FacturasService {
    constructor(
        @InjectRepository(Sale)
        private salesRepository: Repository<Sale>,
        private mailService: MailService,
    ) { }

    async generateFactura(saleId: number): Promise<string> {
        const sale = await this.salesRepository.findOne({
            where: { id_venta: saleId },
            relations: ['detalles', 'detalles.motocicleta', 'usuario'],
        });

        if (!sale) {
            throw new NotFoundException(`Venta con ID ${saleId} no encontrada`);
        }

        const facturasDir = path.join(process.cwd(), 'public', 'facturas');
        if (!fs.existsSync(facturasDir)) {
            fs.mkdirSync(facturasDir, { recursive: true });
        }

        const fileName = `factura-${saleId}-${Date.now()}.pdf`;
        const filePath = path.join(facturasDir, fileName);

        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        doc.fontSize(28).fillColor('#1e40af').text('MotoRShop', { align: 'center' });
        doc.fontSize(10).fillColor('#6b7280').text('Tu destino para las mejores motocicletas', { align: 'center' });
        doc.moveDown();

        doc.fontSize(20).fillColor('#000000').text('FACTURA ELECTRÓNICA', { align: 'center' });
        doc.moveDown();

        doc.fontSize(10);
        doc.fillColor('#374151').text(`N° de Factura: INV-${String(saleId).padStart(6, '0')}`, { align: 'right' });
        doc.text(`Fecha: ${new Date(sale.fecha_venta).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}`, { align: 'right' });
        doc.moveDown();

        doc.fontSize(11).fillColor('#000000').text('MOTORSHOP S.A.', 50, doc.y);
        doc.fontSize(9).fillColor('#6b7280');
        doc.text('Email: contacto@motorshop.com');
        doc.text('Tel: +593 995 020 929');
        doc.text('Quito, Ecuador');
        doc.moveDown();

        doc.fontSize(11).fillColor('#000000').text('Cliente:');
        doc.fontSize(9).fillColor('#6b7280');
        doc.text(`Nombre: ${sale.usuario.nombre}`);
        doc.text(`Email: ${sale.usuario.email}`);
        if (sale.usuario.telefono) {
            doc.text(`Teléfono: ${sale.usuario.telefono}`);
        }
        doc.moveDown();

        doc.fontSize(10).fillColor('#000000').text(`Método de Pago: ${sale.metodo_pago}`);
        doc.moveDown();

        const tableTop = doc.y;

        doc.rect(50, tableTop, 500, 25).fillAndStroke('#1e40af', '#1e40af');

        doc.fillColor('#ffffff').fontSize(10);
        doc.text('Producto', 60, tableTop + 7, { width: 220, continued: false });
        doc.text('Cant.', 280, tableTop + 7, { width: 50, align: 'center', continued: false });
        doc.text('Precio Unit.', 330, tableTop + 7, { width: 100, align: 'right', continued: false });
        doc.text('Subtotal', 430, tableTop + 7, { width: 110, align: 'right', continued: false });

        let yPosition = tableTop + 35;
        let subtotal = 0;

        sale.detalles.forEach((detalle, index) => {
            const itemSubtotal = Number(detalle.precio_unitario) * detalle.cantidad;
            subtotal += itemSubtotal;

            if (index % 2 === 0) {
                doc.rect(50, yPosition - 5, 500, 20).fillAndStroke('#f3f4f6', '#f3f4f6');
            }

            doc.fillColor('#000000').fontSize(9);
            doc.text(detalle.motocicleta.nombre, 60, yPosition, { width: 220 });
            doc.text(detalle.cantidad.toString(), 280, yPosition, { width: 50, align: 'center' });
            doc.text(`$${Number(detalle.precio_unitario).toFixed(2)}`, 330, yPosition, { width: 100, align: 'right' });
            doc.text(`$${itemSubtotal.toFixed(2)}`, 430, yPosition, { width: 110, align: 'right' });

            yPosition += 25;
        });

        yPosition += 10;
        const tax = subtotal * 0.15; // 15% IVA
        const total = subtotal + tax;

        doc.fontSize(10);
        doc.text('Subtotal:', 350, yPosition, { width: 100, align: 'right' });
        doc.text(`$${subtotal.toFixed(2)}`, 450, yPosition, { width: 90, align: 'right' });

        yPosition += 20;
        doc.text('IVA (12%):', 350, yPosition, { width: 100, align: 'right' });
        doc.text(`$${tax.toFixed(2)}`, 450, yPosition, { width: 90, align: 'right' });

        yPosition += 20;
        doc.fontSize(12).fillColor('#1e40af');
        doc.text('TOTAL:', 350, yPosition, { width: 100, align: 'right' });
        doc.text(`$${total.toFixed(2)}`, 450, yPosition, { width: 90, align: 'right' });

        // Footer
        doc.fontSize(8).fillColor('#9ca3af');
        doc.text(
            'Gracias por su compra. Esta es una factura electrónica válida.',
            50,
            doc.page.height - 100,
            { align: 'center', width: 500 }
        );

        doc.end();

        return new Promise((resolve, reject) => {
            stream.on('finish', async () => {
                try {
                    await this.mailService.sendMail({
                        to: sale.usuario.email,
                        subject: `✅ Factura #${String(saleId).padStart(6, '0')} - MotoRShop`,
                        message: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                <h1 style="color: #1e40af;">¡Gracias por tu compra!</h1>
                                <p>Hola <strong>${sale.usuario.nombre}</strong>,</p>
                                <p>Tu compra ha sido procesada exitosamente. Adjunto encontrarás tu factura electrónica.</p>
                                
                                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                    <h3 style="margin-top: 0; color: #374151;">Detalles de tu pedido:</h3>
                                    <p><strong>N° de Orden:</strong> #${String(saleId).padStart(6, '0')}</p>
                                    <p><strong>Fecha:</strong> ${new Date(sale.fecha_venta).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    <p><strong>Método de Pago:</strong> ${sale.metodo_pago}</p>
                                    <p><strong>Total:</strong> $${Number(sale.total).toFixed(2)}</p>
                                </div>

                                <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
                                <p style="color: #6b7280; font-size: 14px;">
                                    <strong>MotoRShop</strong><br>
                                    Email: contacto@motorshop.com<br>
                                    Tel: +593 995 020 929
                                </p>
                            </div>
                        `,
                        attachments: [{
                            filename: `factura-${saleId}.pdf`,
                            path: filePath,
                        }],
                    });
                } catch (emailError) {
                }

                resolve(fileName);
            });
            stream.on('error', reject);
        });
    }

    getFacturaPath(fileName: string): string {
        return path.join(process.cwd(), 'public', 'facturas', fileName);
    }
}

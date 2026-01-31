import * as nodemailer from 'nodemailer';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SendMailDto } from './dto/send-mail.dto';

@Injectable()
export class MailService {

    async sendMail(dto: SendMailDto) {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,          // SSL DIRECTO
            secure: true,       // Evita STARTTLS en 587
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false, // Evita certificados dañados de Windows
                minVersion: 'TLSv1.2',
            },
        });

        try {
            const mailOptions: any = {
                from: process.env.MAIL_USER,
                to: dto.to,
                subject: dto.subject,
                html: dto.message,
            };

            // Add attachments if provided
            if (dto.attachments && dto.attachments.length > 0) {
                mailOptions.attachments = dto.attachments;
            }

            const info = await transporter.sendMail(mailOptions);

            return { messageId: info.messageId };
        } catch (error) {
            throw new InternalServerErrorException(
                `No se pudo enviar el correo: ${error.message || 'Error desconocido'}`
            );
        }
    }
}

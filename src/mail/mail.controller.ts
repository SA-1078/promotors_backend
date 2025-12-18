import { Controller, Post, Body } from '@nestjs/common';
import { MailService } from './mail.service';
import { SendMailDto } from './dto/send-mail.dto';
import { SuccessResponseDto } from '../common/dto/response.dto';

@Controller('mail')
export class MailController {
    constructor(private readonly mailService: MailService) { }

    @Post('gmail')
    async sendGmail(@Body() dto: SendMailDto) {
        const result = await this.mailService.sendMail(dto);
        return new SuccessResponseDto('Correo enviado con Gmail', result);
    }
}

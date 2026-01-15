import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from '../mail.service';
import { InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('MailService', () => {
    let service: MailService;

    const mockTransporter = {
        sendMail: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [MailService],
        }).compile();

        service = module.get<MailService>(MailService);
        (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);
        jest.clearAllMocks();
    });

    it('deberia estar definido', () => {
        expect(service).toBeDefined();
    });

    describe('sendMail', () => {
        it('deberia enviar un correo exitosamente', async () => {
            const mockInfo = { messageId: '12345' };
            mockTransporter.sendMail.mockResolvedValue(mockInfo);

            const result = await service.sendMail({
                to: 'test@example.com',
                subject: 'Test',
                message: 'Test message',
            });

            expect(mockTransporter.sendMail).toHaveBeenCalled();
            expect(result.messageId).toBe('12345');
        });

        it('deberia lanzar InternalServerErrorException en caso de error', async () => {
            mockTransporter.sendMail.mockRejectedValue(new Error('Mail error'));

            await expect(service.sendMail({
                to: 'test@example.com',
                subject: 'Test',
                message: 'Test',
            })).rejects.toThrow(InternalServerErrorException);
        });
    });
});

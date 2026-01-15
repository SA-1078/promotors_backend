import { Test, TestingModule } from '@nestjs/testing';
import { MailController } from '../mail.controller';
import { MailService } from '../mail.service';
import { SuccessResponseDto } from '../../common/dto/response.dto';

describe('MailController', () => {
    let controller: MailController;

    const mockMailService = {
        sendMail: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MailController],
            providers: [{ provide: MailService, useValue: mockMailService }],
        }).compile();

        controller = module.get<MailController>(MailController);
        jest.clearAllMocks();
    });

    it('deberia estar definido', () => {
        expect(controller).toBeDefined();
    });

    it('deberia enviar un correo', async () => {
        mockMailService.sendMail.mockResolvedValue({ messageId: '12345' });

        const result = await controller.sendGmail({
            to: 'test@example.com',
            subject: 'Test',
            message: 'Test message',
        });

        expect(mockMailService.sendMail).toHaveBeenCalled();
        expect(result).toBeInstanceOf(SuccessResponseDto);
        expect(result.message).toBe('Correo enviado con Gmail');
    });
});

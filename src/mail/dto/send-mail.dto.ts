import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendMailDto {
    @IsEmail()
    to: string;

    @IsString()
    @IsNotEmpty()
    subject: string;

    @IsString()
    @IsNotEmpty()
    message: string;

    @IsOptional()
    attachments?: Array<{
        filename: string;
        path?: string;
        content?: Buffer;
    }>;
}

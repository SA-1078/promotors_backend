import { Controller, Post, Body, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SuccessResponseDto } from '../common/dto/response.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    async login(@Body() loginDto: LoginDto, @Req() req: Request) {
        const ip = req.ip || req.connection.remoteAddress || 'Unknown';
        const result = await this.authService.login(loginDto, ip);
        return new SuccessResponseDto('Login successful', result);
    }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        const user = await this.authService.register(registerDto);
        return new SuccessResponseDto('User registered successfully', user);
    }
}

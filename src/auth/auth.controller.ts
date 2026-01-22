import { Controller, Post, Body, Req, Get, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';
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
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const secChUa = req.headers['sec-ch-ua'] as string || '';
        const result = await this.authService.login(loginDto, ip, userAgent, secChUa);
        return new SuccessResponseDto('Login successful', result);
    }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        const user = await this.authService.register(registerDto);
        return new SuccessResponseDto('User registered successfully', user);
    }

    @UseGuards(JwtAuthGuard)
    @Get('verify')
    verify() {
        return new SuccessResponseDto('Token is valid', { valid: true });
    }
}

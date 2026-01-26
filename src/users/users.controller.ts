import {
    Controller, Get, Post, Put, Delete, Body, Param,
    Query, InternalServerErrorException, ParseIntPipe, UseGuards
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SuccessResponseDto } from '../common/dto/response.dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { User } from './user.entity';
import { QueryDto } from '../common/dto/query.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('has-admin')
    async hasAdmin() {
        const hasAdmin = await this.usersService.hasAdmin();
        return new SuccessResponseDto('Admin check completed', { hasAdmin });
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Post()
    async create(@Body() dto: CreateUserDto) {
        const user = await this.usersService.create(dto);
        return new SuccessResponseDto('User created successfully', user);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(
        @Query() query: QueryDto,
    ): Promise<SuccessResponseDto<Pagination<User>>> {
        // Limitar el tamaño máximo de página por seguridad (ahora también en DTO)
        if (query.limit && query.limit > 100) {
            query.limit = 100;
        }

        const result = await this.usersService.findAll(query);
        return new SuccessResponseDto('Users retrieved successfully', result);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const user = await this.usersService.findOne(id);
        return new SuccessResponseDto('User retrieved successfully', user);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Put(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
        const user = await this.usersService.update(id, dto);
        return new SuccessResponseDto('User updated successfully', user);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        const user = await this.usersService.remove(id);
        return new SuccessResponseDto('User deleted successfully', user);
    }
}

import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    paginate,
    Pagination,
} from 'nestjs-typeorm-paginate';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryDto } from '../common/dto/query.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User | null> {
        try {
            const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
            const { password, ...userData } = createUserDto;
            const user = this.userRepository.create({
                ...userData,
                password_hash: hashedPassword,
            });
            return await this.userRepository.save(user);
        } catch (err) {
            console.error('Error creating user:', err);
            return null;
        }
    }

    async findAll(
        queryDto: QueryDto,
    ): Promise<Pagination<User> | null> {
        try {
            const { page, limit, search, searchField, sort, order } = queryDto;

            const query = this.userRepository.createQueryBuilder('user');

            if (search) {
                if (searchField) {
                    switch (searchField) {
                        case 'nombre':
                            query.andWhere('user.nombre ILIKE :search', { search: `%${search}%` });
                            break;
                        case 'email':
                            query.andWhere('user.email ILIKE :search', { search: `%${search}%` });
                            break;
                        default:
                            query.andWhere(
                                '(user.nombre ILIKE :search OR user.email ILIKE :search)',
                                { search: `%${search}%` },
                            );
                    }
                } else {
                    query.andWhere(
                        '(user.nombre ILIKE :search OR user.email ILIKE :search)',
                        { search: `%${search}%` },
                    );
                }
            }

            if (sort) {
                query.orderBy(`user.${sort}`, (order ?? 'ASC') as 'ASC' | 'DESC');
            } else {
                query.orderBy('user.id_usuario', 'DESC');
            }

            return await paginate<User>(query, { page, limit });
        } catch (err) {
            console.error('Error retrieving users:', err);
            return null;
        }
    }

    async findOne(id: number): Promise<User | null> {
        try {
            return await this.userRepository.findOne({ where: { id_usuario: id } });
        } catch (err) {
            console.error('Error finding user:', err);
            return null;
        }
    }

    async findByEmail(email: string): Promise<User | null> {
        try {
            return await this.userRepository.findOne({ where: { email } });
        } catch (err) {
            console.error('Error finding user by email:', err);
            return null;
        }
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<User | null> {
        try {
            const user = await this.userRepository.findOne({ where: { id_usuario: id } });
            if (!user) return null;

            if (updateUserDto.password) {
                user.password_hash = await bcrypt.hash(updateUserDto.password, 10);
                delete updateUserDto.password;
            }

            Object.assign(user, updateUserDto);
            return await this.userRepository.save(user);
        } catch (err) {
            console.error('Error updating user:', err);
            return null;
        }
    }

    async remove(id: number): Promise<User | null> {
        try {
            const user = await this.findOne(id);
            if (!user) return null;

            return await this.userRepository.remove(user);
        } catch (err) {
            console.error('Error deleting user:', err);
            return null;
        }
    }
}

import * as bcrypt from 'bcrypt';
import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
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
    private readonly logger = new Logger(UsersService.name);

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        try {
            // Hashear la contraseña antes de guardarla
            const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
            // Mapear DTO 'password' a Entidad 'password_hash' y excluir el password en texto plano
            const { password, ...userData } = createUserDto;
            // Crear instancia de usuario con la data mapeada
            const user = this.userRepository.create({
                ...userData,
                password_hash: hashedPassword,
            });
            // Guardar en base de datos
            return await this.userRepository.save(user);
        } catch (err) {
            this.logger.error('Error creating user', err.stack);
            throw new InternalServerErrorException('Failed to create user');
        }
    }

    async findAll(
        queryDto: QueryDto,
    ): Promise<Pagination<User>> {
        try {
            const { page, limit, search, searchField, sort, order } = queryDto;

            const query = this.userRepository.createQueryBuilder('user');

            if (search) {
                // Lógica de búsqueda flexible por campo específico o general
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
                    // Búsqueda general por nombre o email si no se especifica campo
                    query.andWhere(
                        '(user.nombre ILIKE :search OR user.email ILIKE :search)',
                        { search: `%${search}%` },
                    );
                }
            }

            // Ordenamiento dinámico con validación para prevenir SQL injection
            if (sort) {
                const allowedSortFields = ['id_usuario', 'nombre', 'email', 'telefono', 'rol', 'fecha_registro'];
                if (!allowedSortFields.includes(sort)) {
                    throw new BadRequestException(`Invalid sort field. Allowed fields: ${allowedSortFields.join(', ')}`);
                }
                query.orderBy(`user.${sort}`, (order ?? 'ASC') as 'ASC' | 'DESC');
            } else {
                query.orderBy('user.id_usuario', 'DESC');
            }

            // Retornar resultados paginados
            return await paginate<User>(query, { page, limit });
        } catch (err) {
            if (err instanceof BadRequestException) {
                throw err;
            }
            this.logger.error('Error retrieving users', err.stack);
            throw new InternalServerErrorException('Failed to retrieve users');
        }
    }

    async findOne(id: number): Promise<User> {
        try {
            const user = await this.userRepository.findOne({ where: { id_usuario: id } });
            if (!user) {
                throw new NotFoundException(`User with ID ${id} not found`);
            }
            return user;
        } catch (err) {
            if (err instanceof NotFoundException) {
                throw err;
            }
            this.logger.error(`Error finding user with ID ${id}`, err.stack);
            throw new InternalServerErrorException('Failed to find user');
        }
    }

    async findByEmail(email: string): Promise<User | null> {
        try {
            return await this.userRepository.findOne({ where: { email } });
        } catch (err) {
            this.logger.error(`Error finding user by email ${email}`, err.stack);
            throw new InternalServerErrorException('Failed to find user by email');
        }
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
        try {
            const user = await this.userRepository.findOne({ where: { id_usuario: id } });
            if (!user) {
                throw new NotFoundException(`User with ID ${id} not found`);
            }

            if (updateUserDto.password) {
                user.password_hash = await bcrypt.hash(updateUserDto.password, 10);
                delete updateUserDto.password;
            }

            Object.assign(user, updateUserDto);
            return await this.userRepository.save(user);
        } catch (err) {
            if (err instanceof NotFoundException) {
                throw err;
            }
            this.logger.error(`Error updating user with ID ${id}`, err.stack);
            throw new InternalServerErrorException('Failed to update user');
        }
    }

    async remove(id: number): Promise<User> {
        try {
            const user = await this.findOne(id);
            return await this.userRepository.remove(user);
        } catch (err) {
            if (err instanceof NotFoundException) {
                throw err;
            }
            this.logger.error(`Error deleting user with ID ${id}`, err.stack);
            throw new InternalServerErrorException('Failed to delete user');
        }
    }
}

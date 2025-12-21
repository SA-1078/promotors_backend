import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('usuarios')
export class User {
    @PrimaryGeneratedColumn()
    id_usuario: number;

    @Column({ length: 100 })
    nombre: string;

    @Column({ length: 120, unique: true })
    email: string;

    @Column({ length: 20 })
    telefono: string;

    @Column('text')
    password_hash: string;

    @Column({ length: 20 }) 
    rol: string;

    @CreateDateColumn()
    fecha_registro: Date;
}

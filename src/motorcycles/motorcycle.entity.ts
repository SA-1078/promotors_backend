import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, DeleteDateColumn } from 'typeorm';
import { Category } from '../categories/category.entity';

@Entity('motocicletas')
export class Motorcycle {
    @PrimaryGeneratedColumn()
    id_moto: number;

    @Column({ length: 150 })
    nombre: string;

    @Column({ length: 100 })
    marca: string;

    @Column({ length: 100 })
    modelo: string;

    @Column('int')
    anio: number;

    @Column('decimal', { precision: 10, scale: 2 })
    precio: number;

    @Column('text')
    descripcion: string;

    @Column()
    id_categoria: number;

    @ManyToOne(() => Category)
    @JoinColumn({ name: 'id_categoria' })
    categoria: Category;

    @Column('text')
    imagen_url: string;

    @DeleteDateColumn()
    deletedAt: Date;
}

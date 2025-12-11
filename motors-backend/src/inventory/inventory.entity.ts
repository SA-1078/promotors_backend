import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, UpdateDateColumn } from 'typeorm';
import { Motorcycle } from '../motorcycles/motorcycle.entity';

@Entity('inventario')
export class Inventory {
    @PrimaryGeneratedColumn()
    id_inventario: number;

    @Column()
    id_moto: number;

    @ManyToOne(() => Motorcycle)
    @JoinColumn({ name: 'id_moto' })
    motorcycle: Motorcycle;

    @Column('int')
    stock_actual: number;

    @Column({ length: 100 })
    ubicacion: string;

    @UpdateDateColumn()
    ultima_actualizacion: Date;
}

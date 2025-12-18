import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Sale } from './sale.entity';
import { Motorcycle } from '../motorcycles/motorcycle.entity';

@Entity('detalle_venta')
export class SaleDetail {
    @PrimaryGeneratedColumn()
    id_detalle: number;

    @Column()
    id_venta: number;

    @ManyToOne(() => Sale, (sale) => sale.detalles, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_venta' })
    venta: Sale;

    @Column()
    id_moto: number;

    @ManyToOne(() => Motorcycle)
    @JoinColumn({ name: 'id_moto' })
    motocicleta: Motorcycle;

    @Column('int')
    cantidad: number;

    @Column('decimal', { precision: 10, scale: 2 })
    precio_unitario: number;

    @Column('decimal', { precision: 10, scale: 2 })
    subtotal: number;
}

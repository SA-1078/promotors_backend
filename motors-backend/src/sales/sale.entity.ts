import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { SaleDetail } from './sale-detail.entity';

@Entity('ventas')
export class Sale {
    @PrimaryGeneratedColumn()
    id_venta: number;

    @Column()
    id_usuario: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'id_usuario' })
    usuario: User;

    @CreateDateColumn()
    fecha_venta: Date;

    @Column('decimal', { precision: 10, scale: 2 })
    total: number;

    @Column({ length: 50 })
    metodo_pago: string;

    @Column({ length: 30 })
    estado: string;

    @OneToMany(() => SaleDetail, (detail) => detail.venta, { cascade: true })
    detalles: SaleDetail[];
}

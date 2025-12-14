import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('leads_crm')
export class Lead {
    @PrimaryGeneratedColumn()
    id_lead: number;

    @Column({ length: 100 })
    nombre: string;

    @Column({ length: 120 })
    email: string;

    @Column({ length: 20 })
    telefono: string;

    @Column('text')
    mensaje: string;

    @Column({ length: 30 })
    estado: string;

    @CreateDateColumn()
    fecha: Date;
}

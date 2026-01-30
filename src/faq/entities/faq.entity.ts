import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('preguntas_frecuentes')
export class Faq {
    @PrimaryGeneratedColumn()
    id_faq: number;

    @Column({ length: 500 })
    pregunta: string;

    @Column('text')
    respuesta: string;

    @Column({ length: 100, nullable: true })
    categoria: string;

    @Column({ default: 0 })
    orden: number;

    @Column({ default: true })
    activo: boolean;

    @CreateDateColumn({ name: 'fecha_creacion' })
    fechaCreacion: Date;

    @UpdateDateColumn({ name: 'fecha_actualizacion' })
    fechaActualizacion: Date;
}

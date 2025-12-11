import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('categorias')
export class Category {
    @PrimaryGeneratedColumn()
    id_categoria: number;

    @Column({ length: 100 })
    nombre: string;

    @Column('text', { nullable: true })
    descripcion: string;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Anime } from './anime';

@Entity('character')
export class Character {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl?: string;

  @Column({ type: 'json', nullable: false })
  attributes!: Record<string, any>;

  @ManyToOne(() => Anime, anime => anime.characters)
  @JoinColumn({ name: 'animeId' })
  anime!: Anime;

  @Column({ type: 'uuid' })
  animeId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

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

export enum AttributeType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  BOOLEAN = 'boolean',
}

export enum AttributeMatchType {
  EXACT_MATCH = 'exact_match',
  PARTIAL_MATCH = 'partial_match',
  RANGE_MATCH = 'range_match',
}

@Entity('attribute')
export class Attribute {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  code!: string;

  @Column({ type: 'enum', enum: AttributeType })
  type!: AttributeType;

  @Column({ type: 'enum', enum: AttributeMatchType })
  matchType?: AttributeMatchType;

  @ManyToOne(() => Anime, anime => anime.attributes)
  @JoinColumn({ name: 'animeId' })
  anime!: Anime;

  @Column({ type: 'uuid' })
  animeId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

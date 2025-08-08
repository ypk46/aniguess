import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Attribute } from './attribute';
import { Character } from './character';

export enum AnimeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('anime')
export class Anime {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl?: string;

  @Column({ type: 'enum', enum: AnimeStatus, default: AnimeStatus.ACTIVE })
  status!: AnimeStatus;

  @OneToMany(() => Attribute, attribute => attribute.anime)
  attributes!: Attribute[];

  @OneToMany(() => Character, character => character.anime)
  characters!: Character[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

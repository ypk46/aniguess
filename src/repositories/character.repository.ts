import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Character } from '../models/character';

export class CharacterRepository {
  private repository: Repository<Character>;

  constructor() {
    this.repository = AppDataSource.getRepository(Character);
  }

  async findAll(
    page: number = 1,
    perPage: number = 10
  ): Promise<{ items: Character[]; total: number }> {
    try {
      const [items, total] = await this.repository.findAndCount({
        relations: ['anime'],
        skip: (page - 1) * perPage,
        take: perPage,
        order: { createdAt: 'DESC' },
      });
      return { items, total };
    } catch (error) {
      console.error('Error fetching character list:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Character | null> {
    try {
      return await this.repository.findOne({
        where: { id },
        relations: ['anime'],
      });
    } catch (error) {
      console.error('Error fetching character by id:', error);
      throw error;
    }
  }

  async findByAnimeId(animeId: string): Promise<Character[]> {
    try {
      return await this.repository.find({
        where: { anime: { id: animeId } },
        relations: ['anime'],
      });
    } catch (error) {
      console.error('Error fetching characters by anime id:', error);
      throw error;
    }
  }

  async create(characterData: Partial<Character>): Promise<Character> {
    try {
      const character = this.repository.create(characterData);
      return await this.repository.save(character);
    } catch (error) {
      console.error('Error creating character:', error);
      throw error;
    }
  }

  async update(
    id: string,
    characterData: Partial<Character>
  ): Promise<Character | null> {
    try {
      await this.repository.update(id, characterData);
      return await this.findById(id);
    } catch (error) {
      console.error('Error updating character:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.repository.delete(id);
      return result.affected !== 0;
    } catch (error) {
      console.error('Error deleting character:', error);
      throw error;
    }
  }
}

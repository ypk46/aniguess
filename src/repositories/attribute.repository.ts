import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Attribute } from '../models/attribute';

export class AttributeRepository {
  private repository: Repository<Attribute>;

  constructor() {
    this.repository = AppDataSource.getRepository(Attribute);
  }

  async findAll(
    page: number = 1,
    perPage: number = 10
  ): Promise<{ items: Attribute[]; total: number }> {
    try {
      const [items, total] = await this.repository.findAndCount({
        relations: ['anime'],
        skip: (page - 1) * perPage,
        take: perPage,
        order: { createdAt: 'DESC' },
      });
      return { items, total };
    } catch (error) {
      console.error('Error fetching attribute list:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Attribute | null> {
    try {
      return await this.repository.findOne({
        where: { id },
        relations: ['anime'],
      });
    } catch (error) {
      console.error('Error fetching attribute by id:', error);
      throw error;
    }
  }

  async findByAnimeId(animeId: string): Promise<Attribute[]> {
    try {
      return await this.repository.find({
        where: { anime: { id: animeId } },
        relations: ['anime'],
      });
    } catch (error) {
      console.error('Error fetching attributes by anime id:', error);
      throw error;
    }
  }

  async create(attributeData: Partial<Attribute>): Promise<Attribute> {
    try {
      const attribute = this.repository.create(attributeData);
      return await this.repository.save(attribute);
    } catch (error) {
      console.error('Error creating attribute:', error);
      throw error;
    }
  }

  async update(
    id: string,
    attributeData: Partial<Attribute>
  ): Promise<Attribute | null> {
    try {
      await this.repository.update(id, attributeData);
      return await this.findById(id);
    } catch (error) {
      console.error('Error updating attribute:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.repository.delete(id);
      return result.affected !== 0;
    } catch (error) {
      console.error('Error deleting attribute:', error);
      throw error;
    }
  }
}

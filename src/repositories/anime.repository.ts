import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Anime } from '../models/anime';

export class AnimeRepository {
  private repository: Repository<Anime>;

  constructor() {
    this.repository = AppDataSource.getRepository(Anime);
  }

  async findAll(
    page: number = 1,
    perPage: number = 10,
    relations: string[] = ['attributes', 'characters']
  ): Promise<{ items: Anime[]; total: number }> {
    try {
      const [items, total] = await this.repository.findAndCount({
        relations,
        skip: (page - 1) * perPage,
        take: perPage,
        order: { createdAt: 'DESC' },
      });
      return { items, total };
    } catch (error) {
      console.error('Error fetching anime list:', error);
      throw error;
    }
  }

  async findById(
    id: string,
    relations: string[] = ['attributes', 'characters']
  ): Promise<Anime | null> {
    try {
      return await this.repository.findOne({
        where: { id },
        relations,
      });
    } catch (error) {
      console.error('Error fetching anime by id:', error);
      throw error;
    }
  }

  async create(animeData: Partial<Anime>): Promise<Anime> {
    try {
      const anime = this.repository.create(animeData);
      return await this.repository.save(anime);
    } catch (error) {
      console.error('Error creating anime:', error);
      throw error;
    }
  }

  async update(id: string, animeData: Partial<Anime>): Promise<Anime | null> {
    try {
      await this.repository.update(id, animeData);
      return await this.findById(id);
    } catch (error) {
      console.error('Error updating anime:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.repository.delete(id);
      return result.affected !== 0;
    } catch (error) {
      console.error('Error deleting anime:', error);
      throw error;
    }
  }
}

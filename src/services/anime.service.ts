import { AnimeRepository } from '../repositories/anime.repository';
import { Anime } from '../models/anime';

export class AnimeService {
  private animeRepository: AnimeRepository;

  constructor() {
    this.animeRepository = new AnimeRepository();
  }

  async getAllAnime(
    page: number = 1,
    perPage: number = 10
  ): Promise<{ items: Anime[]; total: number }> {
    try {
      return await this.animeRepository.findAll(page, perPage, []);
    } catch (error) {
      console.error('Error in AnimeService.getAllAnime:', error);
      throw error;
    }
  }

  async getAnimeById(id: string): Promise<Anime | null> {
    try {
      return await this.animeRepository.findById(id, ['attributes']);
    } catch (error) {
      console.error('Error in AnimeService.getAnimeById:', error);
      throw error;
    }
  }

  async createAnime(animeData: Partial<Anime>): Promise<Anime> {
    try {
      return await this.animeRepository.create(animeData);
    } catch (error) {
      console.error('Error in AnimeService.createAnime:', error);
      throw error;
    }
  }

  async updateAnime(
    id: string,
    animeData: Partial<Anime>
  ): Promise<Anime | null> {
    try {
      return await this.animeRepository.update(id, animeData);
    } catch (error) {
      console.error('Error in AnimeService.updateAnime:', error);
      throw error;
    }
  }

  async deleteAnime(id: string): Promise<boolean> {
    try {
      return await this.animeRepository.delete(id);
    } catch (error) {
      console.error('Error in AnimeService.deleteAnime:', error);
      throw error;
    }
  }
}

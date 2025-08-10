import { CharacterRepository } from '../repositories/character.repository';
import { Character } from '../models/character';

export class CharacterService {
  private characterRepository: CharacterRepository;

  constructor() {
    this.characterRepository = new CharacterRepository();
  }

  async getAllCharacters(
    page: number = 1,
    perPage: number = 10
  ): Promise<{ items: Character[]; total: number }> {
    try {
      return await this.characterRepository.findAll(page, perPage);
    } catch (error) {
      console.error('Error in CharacterService.getAllCharacters:', error);
      throw error;
    }
  }

  async getCharacterById(id: string): Promise<Character | null> {
    try {
      return await this.characterRepository.findById(id);
    } catch (error) {
      console.error('Error in CharacterService.getCharacterById:', error);
      throw error;
    }
  }

  async getCharactersByAnimeId(animeId: string): Promise<Character[]> {
    try {
      return await this.characterRepository.findByAnimeId(animeId);
    } catch (error) {
      console.error('Error in CharacterService.getCharactersByAnimeId:', error);
      throw error;
    }
  }

  async createCharacter(characterData: Partial<Character>): Promise<Character> {
    try {
      return await this.characterRepository.create(characterData);
    } catch (error) {
      console.error('Error in CharacterService.createCharacter:', error);
      throw error;
    }
  }

  async updateCharacter(
    id: string,
    characterData: Partial<Character>
  ): Promise<Character | null> {
    try {
      return await this.characterRepository.update(id, characterData);
    } catch (error) {
      console.error('Error in CharacterService.updateCharacter:', error);
      throw error;
    }
  }

  async deleteCharacter(id: string): Promise<boolean> {
    try {
      return await this.characterRepository.delete(id);
    } catch (error) {
      console.error('Error in CharacterService.deleteCharacter:', error);
      throw error;
    }
  }

  async getRandomCharactersByAnimeId(
    animeId: string,
    count: number
  ): Promise<Character[]> {
    try {
      return await this.characterRepository.findRandomByAnimeId(animeId, count);
    } catch (error) {
      console.error(
        'Error in CharacterService.getRandomCharactersByAnimeId:',
        error
      );
      throw error;
    }
  }
}

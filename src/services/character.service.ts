import { CharacterRepository } from '../repositories/character.repository';
import { Character } from '../models/character';
import redisClient from '../config/redis';

export class CharacterService {
  private characterRepository: CharacterRepository;
  private readonly CHARACTER_KEY_PREFIX = 'char:';
  private readonly ANIME_CHARACTERS_KEY_PREFIX = 'anime_characters:';
  private readonly CHARACTER_CACHE_TTL = 3600 * 24; // 24 hours in seconds

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

  /**
   * Cache all characters for a specific anime in Redis
   */
  async cacheCharactersForAnime(animeId: string): Promise<void> {
    try {
      // First check if characters are already cached by checking if anime characters set exists
      const animeCharactersKey = `${this.ANIME_CHARACTERS_KEY_PREFIX}${animeId}`;
      const exists = await redisClient.exists(animeCharactersKey);

      if (exists) {
        console.log(`Characters for anime ${animeId} already cached`);
        return;
      }

      // Fetch all characters for the anime from PostgreSQL
      const characters = await this.characterRepository.findByAnimeId(animeId);

      if (characters.length === 0) {
        console.log(`No characters found for anime ${animeId}`);
        return;
      }

      // Cache each character as a Redis Hash
      const pipeline = redisClient.multi();
      const characterData: Array<{ id: string; name: string }> = [];

      for (const character of characters) {
        const characterKey = `${this.CHARACTER_KEY_PREFIX}${character.id}`;

        // Flatten attributes and create hash fields
        const hashFields: Record<string, string> = {
          id: character.id,
          name: character.name,
          animeId: character.animeId,
        };

        // Add image URL if it exists
        if (character.imageUrl) {
          hashFields.imageUrl = character.imageUrl;
        }

        // Flatten attributes into the hash
        if (character.attributes && typeof character.attributes === 'object') {
          for (const [key, value] of Object.entries(character.attributes)) {
            hashFields[key] = String(value);
          }
        }

        // Store character hash
        pipeline.hSet(characterKey, hashFields);
        pipeline.expire(characterKey, this.CHARACTER_CACHE_TTL);

        // Collect character data for autocomplete
        characterData.push({ id: character.id, name: character.name });
      }

      // Store character data as JSON for autocomplete
      if (characterData.length > 0) {
        pipeline.set(animeCharactersKey, JSON.stringify(characterData));
        pipeline.expire(animeCharactersKey, this.CHARACTER_CACHE_TTL);
      }

      // Execute all Redis operations
      await pipeline.exec();

      console.log(
        `Cached ${characters.length} characters for anime ${animeId}`
      );
    } catch (error) {
      console.error('Error caching characters for anime:', error);
      throw error;
    }
  }

  /**
   * Get character data from Redis cache
   */
  async getCachedCharacter(characterId: string): Promise<any | null> {
    try {
      const characterKey = `${this.CHARACTER_KEY_PREFIX}${characterId}`;
      const characterData = await redisClient.hGetAll(characterKey);

      if (Object.keys(characterData).length === 0) {
        return null;
      }

      return characterData;
    } catch (error) {
      console.error('Error getting cached character:', error);
      throw error;
    }
  }

  /**
   * Get all character data for an anime from Redis cache (for autocomplete)
   */
  async getCachedCharacterNames(
    animeId: string
  ): Promise<Array<{ id: string; name: string }>> {
    try {
      const animeCharactersKey = `${this.ANIME_CHARACTERS_KEY_PREFIX}${animeId}`;
      const characterDataJson = await redisClient.get(animeCharactersKey);

      if (!characterDataJson) {
        return [];
      }

      const characterData = JSON.parse(characterDataJson);
      return Array.isArray(characterData) ? characterData : [];
    } catch (error) {
      console.error('Error getting cached character names:', error);
      throw error;
    }
  }

  /**
   * Clear character cache for a specific anime
   */
  async clearCharacterCache(animeId: string): Promise<void> {
    try {
      // Get all characters for the anime first
      const characters = await this.characterRepository.findByAnimeId(animeId);

      // Delete individual character hashes
      const pipeline = redisClient.multi();
      for (const character of characters) {
        const characterKey = `${this.CHARACTER_KEY_PREFIX}${character.id}`;
        pipeline.del(characterKey);
      }

      // Delete the anime characters data
      const animeCharactersKey = `${this.ANIME_CHARACTERS_KEY_PREFIX}${animeId}`;
      pipeline.del(animeCharactersKey);

      await pipeline.exec();

      console.log(`Cleared character cache for anime ${animeId}`);
    } catch (error) {
      console.error('Error clearing character cache:', error);
      throw error;
    }
  }
}

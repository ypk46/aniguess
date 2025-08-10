import { Request, Response } from 'express';
import { CharacterService } from '../services/character.service';
import { ApiResponse, PaginatedResponse } from '../types/responses/common';

export class CharacterController {
  private characterService: CharacterService;

  constructor() {
    this.characterService = new CharacterService();
  }

  getAllCharacters = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const perPage = parseInt(req.query.perPage as string) || 10;

      const { items, total } = await this.characterService.getAllCharacters(
        page,
        perPage
      );

      const response: PaginatedResponse = {
        success: true,
        result: items,
        page,
        perPage,
        total,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error in CharacterController.getAllCharacters:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to fetch character list',
      };
      res.status(500).json(response);
    }
  };

  getCharacterById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        const response: ApiResponse = {
          success: false,
          message: 'Character ID is required',
        };
        res.status(400).json(response);
        return;
      }

      const character = await this.characterService.getCharacterById(id);

      if (!character) {
        const response: ApiResponse = {
          success: false,
          message: 'Character not found',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        result: character,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error in CharacterController.getCharacterById:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to fetch character',
      };
      res.status(500).json(response);
    }
  };

  getCharactersByAnimeId = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { animeId } = req.params;

      if (!animeId) {
        const response: ApiResponse = {
          success: false,
          message: 'Anime ID is required',
        };
        res.status(400).json(response);
        return;
      }

      const characters =
        await this.characterService.getCharactersByAnimeId(animeId);

      const response: ApiResponse = {
        success: true,
        result: characters,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error(
        'Error in CharacterController.getCharactersByAnimeId:',
        error
      );
      const response: ApiResponse = {
        success: false,
        message: 'Failed to fetch characters',
      };
      res.status(500).json(response);
    }
  };

  createCharacter = async (req: Request, res: Response): Promise<void> => {
    try {
      const characterData = req.body;
      const character =
        await this.characterService.createCharacter(characterData);

      const response: ApiResponse = {
        success: true,
        result: character,
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Error in CharacterController.createCharacter:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to create character',
      };
      res.status(500).json(response);
    }
  };

  updateCharacter = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        const response: ApiResponse = {
          success: false,
          message: 'Character ID is required',
        };
        res.status(400).json(response);
        return;
      }

      const characterData = req.body;
      const character = await this.characterService.updateCharacter(
        id,
        characterData
      );

      if (!character) {
        const response: ApiResponse = {
          success: false,
          message: 'Character not found',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        result: character,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error in CharacterController.updateCharacter:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to update character',
      };
      res.status(500).json(response);
    }
  };

  deleteCharacter = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        const response: ApiResponse = {
          success: false,
          message: 'Character ID is required',
        };
        res.status(400).json(response);
        return;
      }

      const deleted = await this.characterService.deleteCharacter(id);

      if (!deleted) {
        const response: ApiResponse = {
          success: false,
          message: 'Character not found',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Character deleted successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error in CharacterController.deleteCharacter:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to delete character',
      };
      res.status(500).json(response);
    }
  };

  getCharacterNamesForAnime = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { animeId } = req.params;

      if (!animeId) {
        const response: ApiResponse = {
          success: false,
          message: 'Anime ID is required',
        };
        res.status(400).json(response);
        return;
      }

      const characterNames =
        await this.characterService.getCachedCharacterNames(animeId);

      const response: ApiResponse = {
        success: true,
        result: characterNames,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error(
        'Error in CharacterController.getCharacterNamesForAnime:',
        error
      );
      const response: ApiResponse = {
        success: false,
        message: 'Failed to fetch character names',
      };
      res.status(500).json(response);
    }
  };
}

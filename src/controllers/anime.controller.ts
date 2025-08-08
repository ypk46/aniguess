import { Request, Response } from 'express';
import { AnimeService } from '../services/anime.service';
import { ApiResponse, PaginatedResponse } from '../types/responses/common';

export class AnimeController {
  private animeService: AnimeService;

  constructor() {
    this.animeService = new AnimeService();
  }

  getAllAnime = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const perPage = parseInt(req.query.perPage as string) || 10;

      const { items, total } = await this.animeService.getAllAnime(
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
      console.error('Error in AnimeController.getAllAnime:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to fetch anime list',
      };
      res.status(500).json(response);
    }
  };

  getAnimeById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        const response: ApiResponse = {
          success: false,
          message: 'Anime ID is required',
        };
        res.status(400).json(response);
        return;
      }

      const anime = await this.animeService.getAnimeById(id);

      if (!anime) {
        const response: ApiResponse = {
          success: false,
          message: 'Anime not found',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        result: anime,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error in AnimeController.getAnimeById:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to fetch anime',
      };
      res.status(500).json(response);
    }
  };

  createAnime = async (req: Request, res: Response): Promise<void> => {
    try {
      const animeData = req.body;
      const anime = await this.animeService.createAnime(animeData);

      const response: ApiResponse = {
        success: true,
        result: anime,
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Error in AnimeController.createAnime:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to create anime',
      };
      res.status(500).json(response);
    }
  };

  updateAnime = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        const response: ApiResponse = {
          success: false,
          message: 'Anime ID is required',
        };
        res.status(400).json(response);
        return;
      }

      const animeData = req.body;
      const anime = await this.animeService.updateAnime(id, animeData);

      if (!anime) {
        const response: ApiResponse = {
          success: false,
          message: 'Anime not found',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        result: anime,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error in AnimeController.updateAnime:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to update anime',
      };
      res.status(500).json(response);
    }
  };

  deleteAnime = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        const response: ApiResponse = {
          success: false,
          message: 'Anime ID is required',
        };
        res.status(400).json(response);
        return;
      }

      const deleted = await this.animeService.deleteAnime(id);

      if (!deleted) {
        const response: ApiResponse = {
          success: false,
          message: 'Anime not found',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Anime deleted successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error in AnimeController.deleteAnime:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to delete anime',
      };
      res.status(500).json(response);
    }
  };
}

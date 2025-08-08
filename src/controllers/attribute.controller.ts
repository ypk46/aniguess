import { Request, Response } from 'express';
import { AttributeService } from '../services/attribute.service';
import { ApiResponse, PaginatedResponse } from '../types/responses/common';

export class AttributeController {
  private attributeService: AttributeService;

  constructor() {
    this.attributeService = new AttributeService();
  }

  getAllAttributes = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const perPage = parseInt(req.query.perPage as string) || 10;

      const { items, total } = await this.attributeService.getAllAttributes(
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
      console.error('Error in AttributeController.getAllAttributes:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to fetch attribute list',
      };
      res.status(500).json(response);
    }
  };

  getAttributeById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        const response: ApiResponse = {
          success: false,
          message: 'Attribute ID is required',
        };
        res.status(400).json(response);
        return;
      }

      const attribute = await this.attributeService.getAttributeById(id);

      if (!attribute) {
        const response: ApiResponse = {
          success: false,
          message: 'Attribute not found',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        result: attribute,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error in AttributeController.getAttributeById:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to fetch attribute',
      };
      res.status(500).json(response);
    }
  };

  getAttributesByAnimeId = async (
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

      const attributes =
        await this.attributeService.getAttributesByAnimeId(animeId);

      const response: ApiResponse = {
        success: true,
        result: attributes,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error(
        'Error in AttributeController.getAttributesByAnimeId:',
        error
      );
      const response: ApiResponse = {
        success: false,
        message: 'Failed to fetch attributes',
      };
      res.status(500).json(response);
    }
  };

  createAttribute = async (req: Request, res: Response): Promise<void> => {
    try {
      const attributeData = req.body;
      const attribute =
        await this.attributeService.createAttribute(attributeData);

      const response: ApiResponse = {
        success: true,
        result: attribute,
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Error in AttributeController.createAttribute:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to create attribute',
      };
      res.status(500).json(response);
    }
  };

  updateAttribute = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        const response: ApiResponse = {
          success: false,
          message: 'Attribute ID is required',
        };
        res.status(400).json(response);
        return;
      }

      const attributeData = req.body;
      const attribute = await this.attributeService.updateAttribute(
        id,
        attributeData
      );

      if (!attribute) {
        const response: ApiResponse = {
          success: false,
          message: 'Attribute not found',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        result: attribute,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error in AttributeController.updateAttribute:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to update attribute',
      };
      res.status(500).json(response);
    }
  };

  deleteAttribute = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        const response: ApiResponse = {
          success: false,
          message: 'Attribute ID is required',
        };
        res.status(400).json(response);
        return;
      }

      const deleted = await this.attributeService.deleteAttribute(id);

      if (!deleted) {
        const response: ApiResponse = {
          success: false,
          message: 'Attribute not found',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Attribute deleted successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error in AttributeController.deleteAttribute:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to delete attribute',
      };
      res.status(500).json(response);
    }
  };
}

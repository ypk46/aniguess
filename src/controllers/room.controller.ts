import { Request, Response } from 'express';
import { RoomService } from '../services/room.service';
import { ApiResponse } from '../types/responses/common';
import { CreateRoomRequest, Player } from '../types/room';

interface CreateRoomRequestBody extends CreateRoomRequest {
  player: Player;
}

export class RoomController {
  private roomService: RoomService;

  constructor() {
    this.roomService = new RoomService();
  }

  createRoom = async (req: Request, res: Response): Promise<void> => {
    try {
      const { animeId, rounds, roundTimer, player }: CreateRoomRequestBody =
        req.body;

      // Basic validation
      if (!animeId || !rounds || !roundTimer || !player) {
        const response: ApiResponse = {
          success: false,
          message:
            'Missing required fields: animeId, rounds, roundTimer, and playerId are required',
        };
        res.status(400).json(response);
        return;
      }

      if (rounds <= 0 || rounds > 20) {
        const response: ApiResponse = {
          success: false,
          message: 'Rounds must be between 1 and 20',
        };
        res.status(400).json(response);
        return;
      }

      if (roundTimer <= 0 || roundTimer > 300) {
        const response: ApiResponse = {
          success: false,
          message: 'Round timer must be between 1 and 300 seconds',
        };
        res.status(400).json(response);
        return;
      }

      // Create the room
      const room = await this.roomService.createRoom({
        animeId,
        rounds,
        roundTimer,
        playerId: player.id,
      });

      // Add the creator as the first player
      const roomWithPlayer = await this.roomService.addPlayerToRoom(
        room.code,
        player
      );

      if (!roomWithPlayer) {
        const response: ApiResponse = {
          success: false,
          message: 'Failed to add player to room',
        };
        res.status(500).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        result: roomWithPlayer,
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Error in RoomController.createRoom:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to create room',
      };
      res.status(500).json(response);
    }
  };

  getRoomByCode = async (req: Request, res: Response): Promise<void> => {
    try {
      const { code } = req.params;

      if (!code) {
        const response: ApiResponse = {
          success: false,
          message: 'Room code is required',
        };
        res.status(400).json(response);
        return;
      }

      const room = await this.roomService.getRoomByCode(code.toUpperCase());

      if (!room) {
        const response: ApiResponse = {
          success: false,
          message: 'Room not found',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        result: room,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error in RoomController.getRoomByCode:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to fetch room',
      };
      res.status(500).json(response);
    }
  };

  joinRoom = async (req: Request, res: Response): Promise<void> => {
    try {
      const { code } = req.params;
      const { player } = req.body;

      if (!code || !player) {
        const response: ApiResponse = {
          success: false,
          message: 'Room code and player are required',
        };
        res.status(400).json(response);
        return;
      }

      const room = await this.roomService.addPlayerToRoom(
        code.toUpperCase(),
        player
      );

      if (!room) {
        const response: ApiResponse = {
          success: false,
          message: 'Room not found',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        result: room,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error in RoomController.joinRoom:', error);
      let message = 'Failed to join room';

      if (error instanceof Error) {
        message = error.message;
      }

      const response: ApiResponse = {
        success: false,
        message,
      };
      res.status(400).json(response);
    }
  };

  leaveRoom = async (req: Request, res: Response): Promise<void> => {
    try {
      const { code } = req.params;
      const { playerId } = req.body;

      if (!code || !playerId) {
        const response: ApiResponse = {
          success: false,
          message: 'Room code and playerId are required',
        };
        res.status(400).json(response);
        return;
      }

      const room = await this.roomService.removePlayerFromRoom(
        code.toUpperCase(),
        playerId
      );

      if (!room) {
        const response: ApiResponse = {
          success: false,
          message: 'Room not found',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        result: room,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error in RoomController.leaveRoom:', error);
      let message = 'Failed to leave room';

      if (error instanceof Error) {
        message = error.message;
      }

      const response: ApiResponse = {
        success: false,
        message,
      };
      res.status(400).json(response);
    }
  };
}

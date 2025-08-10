import redisClient from '../config/redis';
import { Room, RoomState, CreateRoomRequest, Player } from '../types/room';
import { socketRegistry } from './socket-registry';

export class RoomService {
  private readonly ROOM_KEY_PREFIX = 'room:';
  private readonly SECRET_CHARACTERS_KEY_PREFIX = 'room_secret:';
  private readonly ROOM_TTL = 3600 * 4; // 4 hours in seconds
  private readonly ROOM_CODE_LENGTH = 6;

  /**
   * Generate a unique room code.
   */
  private generateRoomCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';

    for (let i = 0; i < this.ROOM_CODE_LENGTH; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }

    return result;
  }

  /**
   * Check if a room code already exists
   */
  private async roomCodeExists(code: string): Promise<boolean> {
    try {
      const exists = await redisClient.exists(this.getRoomKey(code));
      return exists === 1;
    } catch (error) {
      console.error('Error checking room code existence:', error);
      throw error;
    }
  }

  /**
   * Generate room key for Redis
   */
  private getRoomKey(code: string): string {
    return `${this.ROOM_KEY_PREFIX}${code}`;
  }

  /**
   * Generate secret characters key for Redis
   */
  private getSecretCharactersKey(code: string): string {
    return `${this.SECRET_CHARACTERS_KEY_PREFIX}${code}`;
  }

  /**
   * Create a new room
   */
  async createRoom(roomData: CreateRoomRequest): Promise<Room> {
    try {
      let roomCode: string;
      let attempts = 0;
      const maxAttempts = 10;

      // Generate unique room code
      do {
        roomCode = this.generateRoomCode();
        attempts++;

        if (attempts >= maxAttempts) {
          throw new Error(
            'Failed to generate unique room code after maximum attempts'
          );
        }
      } while (await this.roomCodeExists(roomCode));

      const now = new Date().toISOString();

      const room: Room = {
        code: roomCode,
        animeId: roomData.animeId,
        rounds: roomData.rounds,
        roundTimer: roomData.roundTimer,
        state: RoomState.LOBBY,
        owner: roomData.playerId,
        players: [],
        createdAt: now,
        updatedAt: now,
      };

      // Store room in Redis as a hash
      const roomKey = this.getRoomKey(roomCode);
      await redisClient.hSet(roomKey, {
        code: room.code,
        animeId: room.animeId,
        rounds: room.rounds.toString(),
        roundTimer: room.roundTimer.toString(),
        state: room.state,
        owner: room.owner,
        players: JSON.stringify(room.players),
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,
      });

      // Set TTL for the room
      await redisClient.expire(roomKey, this.ROOM_TTL);

      return room;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  }

  /**
   * Get room by code
   */
  async getRoomByCode(code: string): Promise<Room | null> {
    try {
      const roomKey = this.getRoomKey(code);
      const roomData = await redisClient.hGetAll(roomKey);

      if (Object.keys(roomData).length === 0) {
        return null;
      }

      // Validate required fields exist
      if (
        !roomData.code ||
        !roomData.animeId ||
        !roomData.rounds ||
        !roomData.roundTimer ||
        !roomData.state ||
        !roomData.createdAt ||
        !roomData.updatedAt ||
        !roomData.owner
      ) {
        console.error('Invalid room data structure in Redis');
        return null;
      }

      const room: Room = {
        code: roomData.code,
        animeId: roomData.animeId,
        rounds: parseInt(roomData.rounds, 10),
        roundTimer: parseInt(roomData.roundTimer, 10),
        state: roomData.state as RoomState,
        players: JSON.parse(roomData.players || '[]'),
        owner: roomData.owner,
        createdAt: roomData.createdAt,
        updatedAt: roomData.updatedAt,
      };

      return room;
    } catch (error) {
      console.error('Error getting room by code:', error);
      throw error;
    }
  }

  /**
   * Update room state
   */
  async updateRoomState(code: string, state: RoomState): Promise<Room | null> {
    try {
      const room = await this.getRoomByCode(code);
      if (!room) {
        return null;
      }

      const roomKey = this.getRoomKey(code);
      const updatedAt = new Date().toISOString();

      await redisClient.hSet(roomKey, {
        state,
        updatedAt,
      });

      room.state = state;
      room.updatedAt = updatedAt;

      const socketService = socketRegistry.getSocketService();
      socketService.broadcast(`room:update:${room.code}`, room);

      return room;
    } catch (error) {
      console.error('Error updating room state:', error);
      throw error;
    }
  }

  /**
   * Add player to room
   */
  async addPlayerToRoom(code: string, player: Player): Promise<Room | null> {
    try {
      const room = await this.getRoomByCode(code);
      if (!room) {
        return null;
      }

      // Check if room is full (max 4 players)
      if (room.players.length >= 4) {
        throw new Error('Room is full. Maximum 4 players allowed.');
      }

      // Check if player is already in the room
      const playerIds = room.players.map(player => player.id);
      if (playerIds.includes(player.id)) {
        throw new Error('Player is already in the room.');
      }

      // Check if room is in lobby state
      if (room.state !== RoomState.LOBBY) {
        throw new Error('Cannot join room. Room is not in lobby state.');
      }

      if (room.players.length === 0) {
        room.owner = player.id;
      }

      room.players.push(player);
      room.updatedAt = new Date().toISOString();

      const roomKey = this.getRoomKey(code);
      await redisClient.hSet(roomKey, {
        players: JSON.stringify(room.players),
        updatedAt: room.updatedAt,
        owner: room.owner,
      });

      const socketService = socketRegistry.getSocketService();
      socketService.broadcast(`room:update:${room.code}`, room);

      return room;
    } catch (error) {
      console.error('Error adding player to room:', error);
      throw error;
    }
  }

  /**
   * Remove player from room
   */
  async removePlayerFromRoom(
    code: string,
    playerId: string
  ): Promise<Room | null> {
    try {
      const room = await this.getRoomByCode(code);
      if (!room) {
        return null;
      }

      const playerIds = room.players.map(player => player.id);
      const playerIndex = playerIds.indexOf(playerId);
      if (playerIndex === -1) {
        throw new Error('Player not found in room.');
      }

      room.players.splice(playerIndex, 1);
      room.updatedAt = new Date().toISOString();

      const roomKey = this.getRoomKey(code);
      await redisClient.hSet(roomKey, {
        players: JSON.stringify(room.players),
        updatedAt: room.updatedAt,
      });

      const socketService = socketRegistry.getSocketService();
      socketService.broadcast(`room:update:${room.code}`, room);

      return room;
    } catch (error) {
      console.error('Error removing player from room:', error);
      throw error;
    }
  }

  async removePlayer(playerId: string): Promise<void> {
    // Get all rooms
    const roomKeys = await redisClient.keys(`${this.ROOM_KEY_PREFIX}*`);
    for (const roomKey of roomKeys) {
      const code = <string>roomKey.split(':')[1];
      const room = await this.getRoomByCode(code);

      // Remove player from room
      if (room) {
        room.players = room.players.filter(player => player.id !== playerId);
        await redisClient.hSet(roomKey, {
          players: JSON.stringify(room.players),
        });

        const socketService = socketRegistry.getSocketService();
        socketService.broadcast(`room:update:${room.code}`, room);
      }
    }
  }

  /**
   * Delete room
   */
  async deleteRoom(code: string): Promise<boolean> {
    try {
      const roomKey = this.getRoomKey(code);
      const secretKey = this.getSecretCharactersKey(code);

      // Delete both room and secret characters
      const roomResult = await redisClient.del(roomKey);
      await redisClient.del(secretKey); // Don't check result for secret characters as they might not exist

      console.log(`Room ${code} deleted`);
      return roomResult === 1;
    } catch (error) {
      console.error('Error deleting room:', error);
      throw error;
    }
  }

  /**
   * Get room TTL (time to live) in seconds
   */
  async getRoomTTL(code: string): Promise<number> {
    try {
      const roomKey = this.getRoomKey(code);
      return await redisClient.ttl(roomKey);
    } catch (error) {
      console.error('Error getting room TTL:', error);
      throw error;
    }
  }

  /**
   * Store secret characters for a room
   */
  async storeSecretCharacters(code: string, characters: any[]): Promise<void> {
    try {
      const secretKey = this.getSecretCharactersKey(code);
      await redisClient.set(secretKey, JSON.stringify(characters));

      // Set TTL for secret characters (same as room TTL)
      await redisClient.expire(secretKey, this.ROOM_TTL);
    } catch (error) {
      console.error('Error storing secret characters:', error);
      throw error;
    }
  }

  /**
   * Get secret characters for a room
   */
  async getSecretCharacters(code: string): Promise<any[] | null> {
    try {
      const secretKey = this.getSecretCharactersKey(code);
      const charactersData = await redisClient.get(secretKey);

      if (!charactersData) {
        return null;
      }

      return JSON.parse(charactersData);
    } catch (error) {
      console.error('Error getting secret characters:', error);
      throw error;
    }
  }
}

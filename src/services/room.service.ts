import redisClient from '../config/redis';
import { Room, RoomState, CreateRoomRequest, Player } from '../types/room';
import { socketRegistry } from './socket-registry';
import { CharacterService } from './character.service';
import { AttributeService } from './attribute.service';
import { AttributeType, AttributeMatchType } from '../models/attribute';

export class RoomService {
  private readonly ROOM_KEY_PREFIX = 'room:';
  private readonly SECRET_CHARACTERS_KEY_PREFIX = 'room_secret:';
  private readonly PLAYER_RESPONSE_KEY_PREFIX = 'player_response:';
  private readonly CURRENT_ROUND_KEY_PREFIX = 'current_round:';
  private readonly ROOM_TTL = 3600 * 4; // 4 hours in seconds
  private readonly ROOM_CODE_LENGTH = 6;
  private characterService: CharacterService;
  private attributeService: AttributeService;

  constructor() {
    this.characterService = new CharacterService();
    this.attributeService = new AttributeService();
  }

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
   * Generate player response key for Redis
   */
  private getPlayerResponseKey(
    roomCode: string,
    playerId: string,
    round: number
  ): string {
    return `${this.PLAYER_RESPONSE_KEY_PREFIX}${roomCode}:${playerId}:${round}`;
  }

  /**
   * Generate current round key for Redis
   */
  private getCurrentRoundKey(roomCode: string, playerId: string): string {
    return `${this.CURRENT_ROUND_KEY_PREFIX}${roomCode}:${playerId}`;
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
      socketService.broadcastToRoom(room.code, 'room:update', room);

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
      socketService.joinSocketToRoom(player.id, room.code);
      socketService.broadcastToRoom(room.code, 'room:update', room);

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
      socketService.broadcastToRoom(room.code, 'room:update', room);

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
        socketService.broadcastToRoom(room.code, 'room:update', room);
      }
    }
  }

  /**
   * Delete room
   */
  async deleteRoom(code: string): Promise<boolean> {
    try {
      const room = await this.getRoomByCode(code);
      const roomKey = this.getRoomKey(code);
      const secretKey = this.getSecretCharactersKey(code);

      const pipeline = redisClient.multi();

      // Delete room and secret characters
      pipeline.del(roomKey);
      pipeline.del(secretKey);

      // Delete player response entries and current round entries for all players
      if (room) {
        for (const player of room.players) {
          // Delete current round tracker
          const currentRoundKey = this.getCurrentRoundKey(code, player.id);
          pipeline.del(currentRoundKey);

          // Delete response entries for all possible rounds
          for (let round = 1; round <= room.rounds; round++) {
            const responseKey = this.getPlayerResponseKey(
              code,
              player.id,
              round
            );
            pipeline.del(responseKey);
          }
        }
      }

      const results = await pipeline.exec();
      // Get result from first operation (room deletion)
      const roomDeletionResult =
        results && results[0] && Array.isArray(results[0]) ? results[0][1] : 0;
      const roomResult =
        typeof roomDeletionResult === 'number' ? roomDeletionResult : 0;

      console.log(`Room ${code} and all associated player data deleted`);
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

  /**
   * Initialize player responses for all players when game starts
   */
  async initializePlayerResponses(roomCode: string): Promise<void> {
    try {
      const room = await this.getRoomByCode(roomCode);
      if (!room) {
        throw new Error('Room not found');
      }

      const pipeline = redisClient.multi();

      for (const player of room.players) {
        // Initialize current round to 1 for each player
        const currentRoundKey = this.getCurrentRoundKey(roomCode, player.id);
        pipeline.set(currentRoundKey, '1');
        pipeline.expire(currentRoundKey, this.ROOM_TTL);

        // Initialize response entry for round 1
        const responseKey = this.getPlayerResponseKey(roomCode, player.id, 1);
        const initialResponse = {
          playerId: player.id,
          roomCode: roomCode,
          round: 1,
          guesses: [],
          isCorrect: false,
          timestamp: new Date().toISOString(),
        };

        pipeline.set(responseKey, JSON.stringify(initialResponse));
      }

      await pipeline.exec();
      console.log(`Initialized player responses for room ${roomCode}`);
    } catch (error) {
      console.error('Error initializing player responses:', error);
      throw error;
    }
  }

  /**
   * Get current round for a player
   */
  async getCurrentRound(roomCode: string, playerId: string): Promise<number> {
    try {
      const currentRoundKey = this.getCurrentRoundKey(roomCode, playerId);
      const round = await redisClient.get(currentRoundKey);
      return round ? parseInt(round, 10) : 1;
    } catch (error) {
      console.error('Error getting current round:', error);
      throw error;
    }
  }

  /**
   * Evaluate character attributes for detailed feedback
   */
  private async evaluateCharacterAttributes(
    animeId: string,
    guessedCharacterData: Record<string, string>,
    correctCharacterData: Record<string, string>
  ): Promise<
    Record<
      string,
      {
        status: 'correct' | 'partial' | 'incorrect' | 'higher' | 'lower';
        value: any;
      }
    >
  > {
    try {
      // Get all attributes for the anime
      const attributes =
        await this.attributeService.getAttributesByAnimeId(animeId);

      const evaluation: Record<
        string,
        {
          status: 'correct' | 'partial' | 'incorrect' | 'higher' | 'lower';
          value: any;
        }
      > = {};

      for (const attribute of attributes) {
        const guessedValue = guessedCharacterData[attribute.code];
        const correctValue = correctCharacterData[attribute.code];

        // Skip if either value is missing
        if (guessedValue === undefined || correctValue === undefined) {
          continue;
        }

        const evaluationResult: {
          status: 'correct' | 'partial' | 'incorrect' | 'higher' | 'lower';
          value: any;
        } = {
          status: 'incorrect',
          value: guessedValue,
        };

        switch (attribute.matchType) {
          case AttributeMatchType.EXACT_MATCH:
            if (guessedValue === correctValue) {
              evaluationResult.status = 'correct';
            } else {
              evaluationResult.status = 'incorrect';
            }
            break;

          case AttributeMatchType.PARTIAL_MATCH:
            try {
              // Parse as arrays for partial matching
              const guessedArray = JSON.parse(guessedValue);
              const correctArray = JSON.parse(correctValue);

              if (Array.isArray(guessedArray) && Array.isArray(correctArray)) {
                const intersection = guessedArray.filter(item =>
                  correctArray.includes(item)
                );

                if (
                  intersection.length === correctArray.length &&
                  intersection.length === guessedArray.length
                ) {
                  evaluationResult.status = 'correct';
                } else if (intersection.length > 0) {
                  evaluationResult.status = 'partial';
                } else {
                  evaluationResult.status = 'incorrect';
                }
              } else {
                // Fallback to exact match if not arrays
                evaluationResult.status =
                  guessedValue === correctValue ? 'correct' : 'incorrect';
              }
            } catch (error) {
              // Fallback to exact match if parsing fails
              evaluationResult.status =
                guessedValue === correctValue ? 'correct' : 'incorrect';
            }
            break;

          case AttributeMatchType.RANGE_MATCH:
            if (attribute.type === AttributeType.NUMBER) {
              const guessedNum = parseFloat(guessedValue);
              const correctNum = parseFloat(correctValue);

              if (!isNaN(guessedNum) && !isNaN(correctNum)) {
                if (guessedNum === correctNum) {
                  evaluationResult.status = 'correct';
                } else if (guessedNum > correctNum) {
                  evaluationResult.status = 'higher';
                } else {
                  evaluationResult.status = 'lower';
                }
              }
            } else {
              // For non-numeric range attributes, fall back to exact match
              evaluationResult.status =
                guessedValue === correctValue ? 'correct' : 'incorrect';
            }
            break;

          default:
            // Default to exact match
            evaluationResult.status =
              guessedValue === correctValue ? 'correct' : 'incorrect';
        }

        evaluation[attribute.code] = evaluationResult;
      }

      return evaluation;
    } catch (error) {
      console.error('Error evaluating character attributes:', error);
      return {};
    }
  }

  /**
   * Submit a guess for a player
   */
  async submitGuess(
    roomCode: string,
    playerId: string,
    characterId: string,
    characterName: string
  ): Promise<{
    isCorrect: boolean;
    currentRound: number;
    attributeEvaluation: Record<
      string,
      {
        status: 'correct' | 'partial' | 'incorrect' | 'higher' | 'lower';
        value: any;
      }
    >;
    characterName: string;
  }> {
    try {
      const room = await this.getRoomByCode(roomCode);
      if (!room) {
        throw new Error('Room not found');
      }

      if (room.state !== RoomState.IN_PROGRESS) {
        throw new Error('Game is not in progress');
      }

      const currentRound = await this.getCurrentRound(roomCode, playerId);

      if (currentRound > room.rounds) {
        throw new Error('All rounds completed');
      }

      // Get secret characters for the room
      const secretCharacters = await this.getSecretCharacters(roomCode);
      if (!secretCharacters || secretCharacters.length < currentRound) {
        throw new Error('Secret characters not found');
      }

      // Get the correct character for current round (0-indexed array)
      const correctCharacter = secretCharacters[currentRound - 1];
      const isCorrect = correctCharacter.id === characterId;

      // Get cached character data for both characters
      const guessedCharacterData =
        await this.characterService.getCachedCharacter(characterId);
      const correctCharacterData =
        await this.characterService.getCachedCharacter(correctCharacter.id);

      let attributeEvaluation: Record<
        string,
        {
          status: 'correct' | 'partial' | 'incorrect' | 'higher' | 'lower';
          value: any;
        }
      > = {};

      // Evaluate attributes only if we have both character data
      if (guessedCharacterData && correctCharacterData) {
        attributeEvaluation = await this.evaluateCharacterAttributes(
          room.animeId,
          guessedCharacterData,
          correctCharacterData
        );
      }

      // Get current response entry
      const responseKey = this.getPlayerResponseKey(
        roomCode,
        playerId,
        currentRound
      );
      const responseData = await redisClient.get(responseKey);

      let response;
      if (responseData) {
        response = JSON.parse(responseData);
      } else {
        // Create new response if it doesn't exist
        response = {
          playerId: playerId,
          roomCode: roomCode,
          round: currentRound,
          guesses: [],
          isCorrect: false,
          timestamp: new Date().toISOString(),
        };
      }

      // Add the guess with detailed evaluation
      response.guesses.push({
        characterId,
        characterName,
        timestamp: new Date().toISOString(),
        isCorrect,
        attributeEvaluation,
      });

      // Update correct flag if this guess is correct
      if (isCorrect) {
        response.isCorrect = true;
      }

      // Store updated response
      await redisClient.set(responseKey, JSON.stringify(response));

      // Set expiry based on round timer
      const responseExpiry = room.roundTimer + 30; // Add 30 seconds buffer
      await redisClient.expire(responseKey, responseExpiry);

      console.log(
        `Player ${playerId} guessed ${characterName} for round ${currentRound}: ${isCorrect ? 'CORRECT' : 'INCORRECT'}`
      );

      return {
        isCorrect,
        currentRound,
        attributeEvaluation,
        characterName,
      };
    } catch (error) {
      console.error('Error submitting guess:', error);
      throw error;
    }
  }

  /**
   * Get player response for a specific round
   */
  async getPlayerResponse(
    roomCode: string,
    playerId: string,
    round: number
  ): Promise<any | null> {
    try {
      const responseKey = this.getPlayerResponseKey(roomCode, playerId, round);
      const responseData = await redisClient.get(responseKey);

      if (!responseData) {
        return null;
      }

      return JSON.parse(responseData);
    } catch (error) {
      console.error('Error getting player response:', error);
      throw error;
    }
  }

  /**
   * Advance player to next round
   */
  async advancePlayerToNextRound(
    roomCode: string,
    playerId: string,
    roundTimer: number
  ): Promise<number> {
    try {
      const currentRound = await this.getCurrentRound(roomCode, playerId);
      const nextRound = currentRound + 1;

      const room = await this.getRoomByCode(roomCode);
      if (!room) {
        throw new Error('Room not found');
      }

      if (nextRound > room.rounds) {
        console.log(`Player ${playerId} has completed all rounds`);
        return currentRound;
      }

      // Update current round
      const currentRoundKey = this.getCurrentRoundKey(roomCode, playerId);
      await redisClient.set(currentRoundKey, nextRound.toString());
      await redisClient.expire(currentRoundKey, this.ROOM_TTL);

      // Initialize response entry for next round
      const responseKey = this.getPlayerResponseKey(
        roomCode,
        playerId,
        nextRound
      );
      const initialResponse = {
        playerId: playerId,
        roomCode: roomCode,
        round: nextRound,
        guesses: [],
        isCorrect: false,
        timestamp: new Date().toISOString(),
      };

      await redisClient.set(responseKey, JSON.stringify(initialResponse));

      console.log(`Player ${playerId} advanced to round ${nextRound}`);
      return nextRound;
    } catch (error) {
      console.error('Error advancing player to next round:', error);
      throw error;
    }
  }
}

import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { WelcomeMessage, PongMessage } from '../types/responses/socket';
import { RoomService } from './room.service';
import { CharacterService } from './character.service';
import { RoomState } from '../types/room';

/**
 * Socket Service
 * Handles WebSocket connections and events
 */
export class SocketService {
  private io: SocketIOServer;

  constructor(server: HttpServer) {
    // Initialize Socket.IO with CORS configuration
    this.io = new SocketIOServer(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    this.initializeSocketHandlers();
  }

  /**
   * Initialize all socket event handlers
   */
  private initializeSocketHandlers(): void {
    this.io.on('connection', (socket: Socket): void => {
      this.handleConnection(socket);
      this.handleGameStart(socket);
      this.handleGuessSubmission(socket);
      this.handlePing(socket);
      this.handleDisconnection(socket);
      this.handleErrors(socket);
    });
  }

  /**
   * Handle new client connections
   */
  private handleConnection(socket: Socket): void {
    // Send welcome message
    const welcomeMessage: WelcomeMessage = {
      message: 'Connected to AniGuess server',
      socketId: socket.id,
      timestamp: new Date().toISOString(),
    };

    socket.emit('welcome', welcomeMessage);
  }

  /**
   * Handle game start
   */
  private handleGameStart(socket: Socket): void {
    const roomService = new RoomService();
    const characterService = new CharacterService();

    socket.on(
      'game-start',
      async (data: { roomCode: string }): Promise<void> => {
        try {
          const { roomCode } = data;

          // Get room details to fetch anime ID and number of rounds
          const room = await roomService.getRoomByCode(roomCode);
          if (!room) {
            socket.emit('error', { message: 'Room not found' });
            return;
          }

          // Cache all characters for the anime (for fast lookups during game)
          await characterService.cacheCharactersForAnime(room.animeId);

          // Fetch random characters for the game based on the number of rounds
          const secretCharacters =
            await characterService.getRandomCharactersByAnimeId(
              room.animeId,
              room.rounds
            );

          if (secretCharacters.length < room.rounds) {
            socket.emit('error', {
              message: `Not enough characters available for ${room.rounds} rounds. Only ${secretCharacters.length} characters found.`,
            });
            return;
          }

          // Store secret characters in Redis (separate from room data)
          await roomService.storeSecretCharacters(roomCode, secretCharacters);

          // Initialize player responses for all players
          await roomService.initializePlayerResponses(roomCode);

          // Start the game in the specified room
          await roomService.updateRoomState(roomCode, RoomState.IN_PROGRESS);

          console.log(
            `Game started for room ${roomCode} with ${secretCharacters.length} secret characters`
          );
        } catch (error) {
          console.error('Error starting game:', error);
          socket.emit('error', { message: 'Failed to start game' });
        }
      }
    );
  }

  /**
   * Handle player guess submissions
   */
  private handleGuessSubmission(socket: Socket): void {
    const roomService = new RoomService();

    socket.on(
      'submit-guess',
      async (data: {
        roomCode: string;
        characterId: string;
        characterName: string;
      }): Promise<void> => {
        try {
          const { roomCode, characterId, characterName } = data;
          const playerId = socket.id; // Player ID is the same as Socket ID

          if (!roomCode || !characterId || !characterName) {
            socket.emit('guess-error', {
              message:
                'Missing required fields: roomCode, characterId, or characterName',
            });
            return;
          }

          // Submit the guess
          const result = await roomService.submitGuess(
            roomCode,
            playerId,
            characterId,
            characterName
          );

          // Send result back to the player
          socket.emit('guess-result', {
            isCorrect: result.isCorrect,
            currentRound: result.currentRound,
            characterName: characterName,
            timestamp: new Date().toISOString(),
          });

          // Broadcast guess to other players in the room (without revealing if it's correct)
          socket.to(`room:${roomCode}`).emit('player-guessed', {
            playerId: playerId,
            characterName: characterName,
            currentRound: result.currentRound,
            timestamp: new Date().toISOString(),
          });

          // If correct, player can advance to next round
          if (result.isCorrect) {
            const nextRound = await roomService.advancePlayerToNextRound(
              roomCode,
              playerId,
              (await roomService.getRoomByCode(roomCode))?.roundTimer || 60
            );

            socket.emit('round-advanced', {
              newRound: nextRound,
              timestamp: new Date().toISOString(),
            });
          }

          console.log(
            `Player ${playerId} submitted guess: ${characterName} (${result.isCorrect ? 'CORRECT' : 'INCORRECT'})`
          );
        } catch (error) {
          console.error('Error handling guess submission:', error);
          socket.emit('guess-error', { message: 'Failed to submit guess' });
        }
      }
    );
  }

  /**
   * Handle ping/pong for connection testing
   */
  private handlePing(socket: Socket): void {
    socket.on('ping', (): void => {
      const pongMessage: PongMessage = {
        timestamp: new Date().toISOString(),
      };

      socket.emit('pong', pongMessage);
    });
  }

  /**
   * Handle client disconnections
   */
  private handleDisconnection(socket: Socket): void {
    const roomService = new RoomService();
    socket.on('disconnect', (reason: string): void => {
      roomService.removePlayer(socket.id);
      console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
    });
  }

  /**
   * Handle connection errors
   */
  private handleErrors(socket: Socket): void {
    socket.on('error', (error: Error): void => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  }

  /**
   * Get the Socket.IO server instance
   */
  public getIO(): SocketIOServer {
    return this.io;
  }

  /**
   * Broadcast a message to all connected clients
   */
  public broadcast(event: string, data: any): void {
    this.io.emit(event, data);
  }

  /**
   * Send a message to a specific socket
   */
  public sendToSocket(socketId: string, event: string, data: any): void {
    this.io.to(socketId).emit(event, data);
  }

  /**
   * Get the number of connected clients
   */
  public getConnectedClientsCount(): number {
    return this.io.engine.clientsCount;
  }

  /**
   * Close all socket connections
   */
  public close(): void {
    this.io.close();
  }

  /**
   * Join a socket to a room
   */
  public joinSocketToRoom(socketId: string, roomCode: string): void {
    const socket = this.io.sockets.sockets.get(socketId);
    if (socket) {
      socket.join(`room:${roomCode}`);
      console.log(`Socket ${socketId} joined room ${roomCode}`);
    }
  }

  /**
   * Remove a socket from a room
   */
  public leaveSocketFromRoom(socketId: string, roomCode: string): void {
    const socket = this.io.sockets.sockets.get(socketId);
    if (socket) {
      socket.leave(`room:${roomCode}`);
      console.log(`Socket ${socketId} left room ${roomCode}`);
    }
  }

  /**
   * Broadcast a message to all clients in a specific room
   */
  public broadcastToRoom(roomCode: string, event: string, data: any): void {
    this.io.to(`room:${roomCode}`).emit(event, data);
  }
}

// Export factory function to create socket service
export function createSocketService(server: HttpServer): SocketService {
  return new SocketService(server);
}

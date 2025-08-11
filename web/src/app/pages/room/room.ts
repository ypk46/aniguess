import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { RoomService } from '../../shared/services/room.service';
import { AnimeService } from '../../shared/services/anime.service';
import {
  PlayerService,
  Room,
  CharacterAutocomplete,
  Attribute,
} from '../../shared';
import {
  GuessResultMessage,
  GameEndMessage,
  PlayerScore,
} from '../../shared/types/socket';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Socket } from 'ngx-socket-io';
import { PlayerCard } from '../../shared/components/player-card/player-card';

@Component({
  selector: 'app-room',
  imports: [CommonModule, FormsModule, PlayerCard],
  templateUrl: './room.html',
  styleUrl: './room.css',
})
export class RoomPage implements OnInit, OnDestroy {
  private roomService = inject(RoomService);
  private animeService = inject(AnimeService);
  private playerService = inject(PlayerService);
  private router = inject(Router);
  private socket = inject(Socket);
  room!: Room;
  currentRound = 1;
  playerName: string | null = null;
  playerId: string | null = null;
  playerNameNotSet = true;

  // Character guess functionality
  guessInput = '';
  selectedCharacterId: string | null = null;
  characters: CharacterAutocomplete[] = [];
  filteredCharacters: CharacterAutocomplete[] = [];
  showSuggestions = false;
  selectedSuggestionIndex = -1;

  // Game state tracking
  isCorrect = false;
  isSubmittingGuess = false;
  guessHistory: Array<{
    isCorrect: boolean;
    characterName: string;
    characterImage?: string;
    attributeEvaluation?: Record<
      string,
      {
        status: 'correct' | 'partial' | 'incorrect' | 'higher' | 'lower';
        value: any;
      }
    >;
    timestamp: string;
  }> = [];
  animeAttributes: Attribute[] = [];

  // Timer functionality
  currentTimer: number = 0;
  timerInterval: any;
  isTimerActive = false;

  // Game end data
  gameEndData: GameEndMessage | null = null;

  ngOnInit() {
    const room = this.roomService.getRoom();
    if (!room) {
      this.router.navigate(['/']);
      return;
    }
    this.room = room;

    this.playerName = this.playerService.getPlayerName();
    this.playerId = this.playerService.getPlayerId();

    this.socket.on('room:update', (room: Room) => {
      this.room = room;

      // Load character names when game starts
      if (room.state === 'in_progress' && this.characters.length === 0) {
        this.loadCharacterNames();
        // Clear guess history when game starts
        this.guessHistory = [];
        // Start timer when game is in progress
        this.startTimer();
      }

      // Stop timer if game is not in progress
      if (room.state !== 'in_progress') {
        this.stopTimer();
      }
    });

    // Listen for guess result
    this.socket.on('guess-result', (data: GuessResultMessage) => {
      this.isSubmittingGuess = false;

      // Add guess to history
      this.guessHistory.unshift({
        isCorrect: data.isCorrect,
        characterName: data.characterName,
        characterImage: data.characterImage,
        attributeEvaluation: data.attributeEvaluation,
        timestamp: data.timestamp,
      });

      if (data.isCorrect) {
        this.isCorrect = true;
        // Stop timer when correct guess is made
        this.stopTimer();
      } else {
        this.isCorrect = false;
      }
    });

    // Listen for round advancement
    this.socket.on(
      'round-advanced',
      (data: { newRound: number; timestamp: string }) => {
        // Clear guess history for new round
        setTimeout(() => {
          this.currentRound = data.newRound;
          this.guessHistory = [];
          this.isCorrect = false;
          // Restart timer for new round
          this.startTimer();
        }, 5000);
      },
    );

    // Listen for other players' guesses
    this.socket.on(
      'player-guessed',
      (data: {
        playerId: string;
        characterName: string;
        currentRound: number;
        timestamp: string;
      }) => {
        console.log(
          `Player ${data.playerId} guessed ${data.characterName} in round ${data.currentRound}`,
        );
      },
    );

    // Listen for guess errors
    this.socket.on('guess-error', (data: { message: string }) => {
      console.error('Guess error:', data.message);
      alert(`Error: ${data.message}`);
    });

    // Listen for game ended
    this.socket.on('game-ended', (data: GameEndMessage) => {
      console.log('Game ended:', data);
      this.gameEndData = data;
      // Stop timer when game ends
      this.stopTimer();
    });
  }

  loadCharacterNames() {
    if (this.room?.animeId) {
      this.animeService.getCharacterNamesForAnime(this.room.animeId).subscribe({
        next: (characters) => {
          this.characters = characters;
        },
        error: (error) => {
          console.error('Error loading character names:', error);
        },
      });

      // Also load anime attributes
      this.loadAnimeAttributes();
    }
  }

  loadAnimeAttributes() {
    if (this.room?.animeId) {
      this.animeService.getAttributesForAnime(this.room.animeId).subscribe({
        next: (attributes) => {
          this.animeAttributes = attributes;
        },
        error: (error) => {
          console.error('Error loading anime attributes:', error);
        },
      });
    }
  }

  onGuessInputChange() {
    const query = this.guessInput.toLowerCase().trim();

    // Clear selected character if input doesn't match
    if (this.selectedCharacterId) {
      const selectedCharacter = this.characters.find(
        (c) => c.id === this.selectedCharacterId,
      );
      if (!selectedCharacter || selectedCharacter.name !== this.guessInput) {
        this.selectedCharacterId = null;
      }
    }

    if (query.length === 0) {
      this.filteredCharacters = [];
      this.showSuggestions = false;
      this.selectedSuggestionIndex = -1;
      return;
    }

    // Check for exact match and auto-select
    const exactMatch = this.characters.find(
      (character) => character.name.toLowerCase() === query,
    );
    if (exactMatch && !this.selectedCharacterId) {
      this.selectedCharacterId = exactMatch.id;
    }

    this.filteredCharacters = this.characters
      .filter((character) => character.name.toLowerCase().includes(query))
      .slice(0, 10); // Limit to 10 suggestions

    this.showSuggestions = this.filteredCharacters.length > 0 && !exactMatch;
    this.selectedSuggestionIndex = -1;
  }

  onKeyDown(event: KeyboardEvent) {
    if (!this.showSuggestions) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedSuggestionIndex = Math.min(
          this.selectedSuggestionIndex + 1,
          this.filteredCharacters.length - 1,
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.selectedSuggestionIndex = Math.max(
          this.selectedSuggestionIndex - 1,
          -1,
        );
        break;
      case 'Enter':
        event.preventDefault();
        if (this.selectedSuggestionIndex >= 0) {
          this.selectCharacter(
            this.filteredCharacters[this.selectedSuggestionIndex],
          );
        } else {
          this.submitGuess();
        }
        break;
      case 'Escape':
        this.showSuggestions = false;
        this.selectedSuggestionIndex = -1;
        break;
    }
  }

  selectCharacter(character: CharacterAutocomplete) {
    this.guessInput = character.name;
    this.selectedCharacterId = character.id;
    this.showSuggestions = false;
    this.selectedSuggestionIndex = -1;
  }

  submitGuess() {
    if (!this.guessInput.trim() || this.isSubmittingGuess) {
      return;
    }

    // If no character is selected, try to find exact match
    if (!this.selectedCharacterId) {
      const exactMatch = this.characters.find(
        (character) =>
          character.name.toLowerCase() === this.guessInput.toLowerCase(),
      );
      if (exactMatch) {
        this.selectedCharacterId = exactMatch.id;
      } else {
        // Invalid character name
        console.warn('Invalid character name:', this.guessInput);
        return;
      }
    }

    this.isSubmittingGuess = true;

    // Emit guess to server with character ID
    this.socket.emit('submit-guess', {
      roomCode: this.room.code,
      characterId: this.selectedCharacterId,
      characterName: this.guessInput,
    });

    // Reset input after guess
    this.guessInput = '';
    this.selectedCharacterId = null;
    this.showSuggestions = false;
    this.selectedSuggestionIndex = -1;
  }

  // Helper method for template
  getAttributeEvaluationEntries(
    evaluation: Record<
      string,
      {
        status: 'correct' | 'partial' | 'incorrect' | 'higher' | 'lower';
        value: any;
      }
    >,
  ): Array<{ key: string; value: { status: string; value: any } }> {
    return Object.entries(evaluation).map(([key, value]) => ({ key, value }));
  }

  // Helper method to get attribute display name
  getAttributeDisplayName(attributeCode: string): string {
    const attribute = this.animeAttributes.find(
      (attr) => attr.code === attributeCode,
    );
    return attribute ? attribute.name : attributeCode;
  }

  // Handle image loading errors
  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.style.display = 'none';
    }
  }

  // Timer methods
  startTimer() {
    if (this.room?.roundTimer) {
      this.currentTimer = this.room.roundTimer;
      this.isTimerActive = true;

      this.timerInterval = setInterval(() => {
        this.currentTimer--;

        if (this.currentTimer <= 0) {
          this.stopTimer();
          this.onTimerExpired();
        }
      }, 1000);
    }
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.isTimerActive = false;
  }

  onTimerExpired() {
    console.log('Timer expired! Skipping round...');
    // Mock method call to skip round
    this.skipRound();
  }

  skipRound() {
    // Mock implementation - this would normally emit to server
    console.log('Skip round called - would emit to server');

    // For demo purposes, just log and potentially show a message
    alert('Time is up! Round will be skipped.');

    // In a real implementation, you would emit to the server:
    // this.socket.emit('skip-round', { roomCode: this.room.code });
  }

  ngOnDestroy() {
    // Clean up timer when component is destroyed
    this.stopTimer();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const autocompleteContainer = target.closest('.autocomplete-container');

    if (!autocompleteContainer) {
      this.showSuggestions = false;
    }
  }

  onGameStart() {
    if (!this.room) return;
    this.socket.emit('game-start', { roomCode: this.room.code });
  }

  goBackToHome() {
    this.router.navigate(['/']);
  }
}

import { Component, inject, OnInit, HostListener } from '@angular/core';
import { RoomService } from '../../shared/services/room.service';
import { AnimeService } from '../../shared/services/anime.service';
import { PlayerService, Room } from '../../shared';
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
export class RoomPage implements OnInit {
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
  characterNames: string[] = [];
  filteredCharacterNames: string[] = [];
  showSuggestions = false;
  selectedSuggestionIndex = -1;

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
      if (room.state === 'in_progress' && this.characterNames.length === 0) {
        this.loadCharacterNames();
      }
    });
  }

  loadCharacterNames() {
    if (this.room?.animeId) {
      this.animeService.getCharacterNamesForAnime(this.room.animeId).subscribe({
        next: (names) => {
          this.characterNames = names;
        },
        error: (error) => {
          console.error('Error loading character names:', error);
        },
      });
    }
  }

  onGuessInputChange() {
    const query = this.guessInput.toLowerCase().trim();

    if (query.length === 0) {
      this.filteredCharacterNames = [];
      this.showSuggestions = false;
      this.selectedSuggestionIndex = -1;
      return;
    }

    this.filteredCharacterNames = this.characterNames
      .filter((name) => name.toLowerCase().includes(query))
      .slice(0, 10); // Limit to 10 suggestions

    this.showSuggestions = this.filteredCharacterNames.length > 0;
    this.selectedSuggestionIndex = -1;
  }

  onKeyDown(event: KeyboardEvent) {
    if (!this.showSuggestions) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedSuggestionIndex = Math.min(
          this.selectedSuggestionIndex + 1,
          this.filteredCharacterNames.length - 1,
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
            this.filteredCharacterNames[this.selectedSuggestionIndex],
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

  selectCharacter(characterName: string) {
    this.guessInput = characterName;
    this.showSuggestions = false;
    this.selectedSuggestionIndex = -1;
  }

  submitGuess() {
    if (!this.guessInput.trim()) {
      return;
    }

    // TODO: Emit guess to server
    console.log('Guessing:', this.guessInput);

    // Reset input after guess
    this.guessInput = '';
    this.showSuggestions = false;
    this.selectedSuggestionIndex = -1;
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
}

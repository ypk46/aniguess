import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AnimeSelect,
  Anime,
  PlayerService,
  RoomData,
} from '../../../../shared';
import { RoomService } from '../../../../shared/services/room.service';

@Component({
  selector: 'app-room-creator',
  imports: [CommonModule, FormsModule, AnimeSelect],
  templateUrl: './room-creator.html',
  styleUrl: './room-creator.css',
})
export class RoomCreator {
  rounds: number = 3;
  roundTimer: number = 120; // In seconds
  selectedAnime: Anime | null = null;
  errorMessage: string = '';

  constructor(
    private playerService: PlayerService,
    private roomService: RoomService,
  ) {}

  onAnimeSelected(anime: Anime | null): void {
    this.selectedAnime = anime;
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.selectedAnime) {
      this.errorMessage = 'Please select an anime.';
      return;
    }

    const playerId = this.playerService.getPlayerId();
    if (!playerId) {
      this.errorMessage = 'Failed to retrieve player ID.';
      return;
    }

    const roomData: RoomData = {
      animeId: this.selectedAnime.id,
      rounds: this.rounds,
      roundTimer: this.roundTimer,
      playerId: playerId,
    };

    this.roomService.createRoom(roomData).subscribe({
      next: (result) => {
        console.log('Room created successfully:', result);
      },
      error: (error) => {
        console.error('Error creating room:', error);
        this.errorMessage = 'Failed to create room.';
      },
    });
  }
}

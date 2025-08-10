import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RoomService } from '../../../../shared/services/room.service';
import { PlayerService } from '../../../../shared';

@Component({
  selector: 'app-room-joiner',
  imports: [CommonModule, FormsModule],
  templateUrl: './room-joiner.html',
  styleUrl: './room-joiner.css',
})
export class RoomJoiner {
  roomCode: string = '';
  errorMessage: string = '';

  constructor(
    private roomService: RoomService,
    private playerService: PlayerService,
  ) {}

  onSubmit() {
    this.errorMessage = '';

    const playerId = this.playerService.getPlayerId();
    if (!playerId) {
      this.errorMessage = 'Failed to retrieve player ID.';
      return;
    }
    this.roomService.joinRoom(this.roomCode, playerId).subscribe({
      next: () => {
        // Handle successful room join
      },
      error: (err) => {
        this.errorMessage = 'Failed to join room: ' + err.message;
      },
    });
  }
}

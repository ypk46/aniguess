import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RoomService } from '../../../../shared/services/room.service';
import { PlayerService, Room } from '../../../../shared';

@Component({
  selector: 'app-room-joiner',
  imports: [CommonModule, FormsModule],
  templateUrl: './room-joiner.html',
  styleUrl: './room-joiner.css',
})
export class RoomJoiner {
  @Output() roomJoined = new EventEmitter<Room>();

  playerName: string = 'Luffy';
  roomCode: string = '36YU14';
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
    this.roomService
      .joinRoom(this.roomCode, { id: playerId, name: this.playerName })
      .subscribe({
        next: (room) => {
          this.playerService.setPlayerName(this.playerName);
          this.roomJoined.emit(room);
        },
        error: (err) => {
          this.errorMessage = 'Failed to join room: ' + err.message;
        },
      });
  }
}

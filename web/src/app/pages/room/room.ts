import { Component, inject, OnInit } from '@angular/core';
import { RoomService } from '../../shared/services/room.service';
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
  private playerService = inject(PlayerService);
  private router = inject(Router);
  private socket = inject(Socket);
  room!: Room;
  currentRound = 1;
  playerName: string | null = null;
  playerId: string | null = null;
  playerNameNotSet = true;

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
    });
  }

  onGameStart() {
    if (!this.room) return;
    this.socket.emit('game-start', { roomCode: this.room.code });
  }
}

import { Component, inject } from '@angular/core';
import { RoomCreator } from './components/room-creator/room-creator';
import { RoomJoiner } from './components/room-joiner/room-joiner';
import { Router } from '@angular/router';
import { Room } from '../../shared';
import { RoomService } from '../../shared/services/room.service';

@Component({
  selector: 'app-home',
  imports: [RoomCreator, RoomJoiner],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomePage {
  private roomService = inject(RoomService);
  private router = inject(Router);

  /**
   * Navigate to the room page
   */
  onNewRoom(room: Room) {
    this.roomService.setRoom(room);
    this.router.navigate(['/room']);
  }
}

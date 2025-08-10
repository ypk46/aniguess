import { Component } from '@angular/core';
import { RoomCreator } from './components/room-creator/room-creator';

@Component({
  selector: 'app-home',
  imports: [RoomCreator],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}

import { Component } from '@angular/core';
import { RoomCreator } from './components/room-creator/room-creator';
import { RoomJoiner } from './components/room-joiner/room-joiner';

@Component({
  selector: 'app-home',
  imports: [RoomCreator, RoomJoiner],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}

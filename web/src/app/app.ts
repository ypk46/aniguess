import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared';
import { Socket } from 'ngx-socket-io';
import { WelcomeMessage } from './shared/types/socket';
import { PlayerService } from './shared/services';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  constructor(
    private socket: Socket,
    private playerService: PlayerService,
  ) {}

  ngOnInit() {
    this.socket.on('welcome', (message: WelcomeMessage) => {
      // Store the socket ID as the player ID
      this.playerService.setPlayerId(message.socketId);
    });
  }
}

import { inject, Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private socket = inject(Socket);
  private playerIdSubject = new BehaviorSubject<string | null>(null);
  private playerNameSubject = new BehaviorSubject<string | null>(null);

  public playerId$ = this.playerIdSubject.asObservable();
  public playerName$ = this.playerNameSubject.asObservable();

  /**
   * Sets the player ID (socket ID)
   * @param socketId The socket ID to store as player ID
   */
  setPlayerId(socketId: string): void {
    this.playerIdSubject.next(socketId);
  }

  /**
   * Gets the current player ID
   * @returns Current player ID or null if not set
   */
  getPlayerId(): string | null {
    return this.playerIdSubject.value;
  }

  /**
   * Clears the player ID
   */
  clearPlayerId(): void {
    this.playerIdSubject.next(null);
  }

  /**
   * Sets the player name
   * @param name The name to store as player name
   */
  setPlayerName(name: string): void {
    this.playerNameSubject.next(name);
  }

  /**
   * Gets the current player name
   * @returns Current player name or null if not set
   */
  getPlayerName(): string | null {
    return this.playerNameSubject.value;
  }

  /**
   * Clears the player name
   */
  clearPlayerName(): void {
    this.playerNameSubject.next(null);
  }
}

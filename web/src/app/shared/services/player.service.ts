import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private playerIdSubject = new BehaviorSubject<string | null>(null);

  /**
   * Observable stream of the current player ID (socket ID)
   */
  public playerId$: Observable<string | null> =
    this.playerIdSubject.asObservable();

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
}

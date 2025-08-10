import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { RoomData, Room, ApiResponse, Player } from '../types';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private readonly apiUrl = `${environment.apiUrl}/rooms`;
  private roomSubject = new BehaviorSubject<Room | null>(null);
  room$ = this.roomSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Sets the current room.
   */
  setRoom(room: Room | null) {
    this.roomSubject.next(room);
  }

  /**
   * Gets the current room.
   */
  getRoom(): Room | null {
    return this.roomSubject.value;
  }

  /**
   * Creates a new room.
   */
  createRoom(roomData: RoomData): Observable<Room> {
    return this.http.post<ApiResponse<Room>>(this.apiUrl, roomData).pipe(
      map((response) => {
        if (response.success) {
          return response.result;
        } else {
          throw new Error(response.message);
        }
      }),
    );
  }

  /**
   * Join a room.
   */
  joinRoom(roomCode: string, player: Player): Observable<Room> {
    return this.http
      .post<ApiResponse<Room>>(`${this.apiUrl}/${roomCode}/join`, { player })
      .pipe(
        map((response) => {
          if (response.success) {
            return response.result;
          } else {
            throw new Error(response.message);
          }
        }),
        catchError((error: HttpErrorResponse) => {
          throw new Error(error.error.message);
        }),
      );
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { RoomData, Room, ApiResponse } from '../types';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private readonly apiUrl = `${environment.apiUrl}/rooms`;

  constructor(private http: HttpClient) {}

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
  joinRoom(roomCode: string, playerId: string): Observable<Room> {
    return this.http
      .post<ApiResponse<Room>>(`${this.apiUrl}/${roomCode}/join`, { playerId })
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

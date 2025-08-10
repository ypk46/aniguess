import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { RoomData, CreateRoomResult, ApiResponse } from '../types';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private readonly apiUrl = `${environment.apiUrl}/rooms`;

  constructor(private http: HttpClient) {}

  /**
   * Creates a new room.
   */
  createRoom(roomData: RoomData): Observable<CreateRoomResult> {
    return this.http
      .post<ApiResponse<CreateRoomResult>>(this.apiUrl, roomData)
      .pipe(
        map((response) => {
          if (response.success) {
            return response.result;
          } else {
            throw new Error(response.message);
          }
        }),
      );
  }
}

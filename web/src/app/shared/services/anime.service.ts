import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Anime, CharacterAutocomplete, PaginatedResponse } from '../types';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AnimeService {
  private readonly apiUrl = `${environment.apiUrl}/anime`;

  constructor(private http: HttpClient) {}

  /**
   * Get all anime with pagination
   */
  getAllAnime(page: number = 1, perPage: number = 100): Observable<Anime[]> {
    return this.http
      .get<
        PaginatedResponse<Anime>
      >(`${this.apiUrl}?page=${page}&perPage=${perPage}`)
      .pipe(map((response) => response.result || []));
  }

  /**
   * Get anime by ID
   */
  getAnimeById(id: string): Observable<Anime | null> {
    return this.http
      .get<{ success: boolean; result?: Anime }>(`${this.apiUrl}/${id}`)
      .pipe(map((response) => response.result || null));
  }

  /**
   * Get character names and IDs for an anime (for autocomplete)
   */
  getCharacterNamesForAnime(
    animeId: string,
  ): Observable<CharacterAutocomplete[]> {
    return this.http
      .get<{
        success: boolean;
        result?: CharacterAutocomplete[];
      }>(`${environment.apiUrl}/characters/anime/${animeId}/names`)
      .pipe(map((response) => response.result || []));
  }
}

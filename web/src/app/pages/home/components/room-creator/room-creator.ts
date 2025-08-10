import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnimeSelect, Anime } from '../../../../shared';

@Component({
  selector: 'app-room-creator',
  imports: [CommonModule, FormsModule, AnimeSelect],
  templateUrl: './room-creator.html',
  styleUrl: './room-creator.css',
})
export class RoomCreator {
  rounds: number = 3;
  roundTimer: number = 120; // In seconds
  selectedAnime: Anime | null = null;

  onAnimeSelected(anime: Anime | null): void {
    this.selectedAnime = anime;
  }

  onSubmit(): void {
    if (!this.selectedAnime) {
      alert('Please select an anime');
      return;
    }
  }
}

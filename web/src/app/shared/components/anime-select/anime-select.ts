import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnimeService, Anime } from '../../../shared';

@Component({
  selector: 'app-anime-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './anime-select.html',
  styleUrl: './anime-select.css',
})
export class AnimeSelect implements OnInit {
  @Input() selectedAnimeId: string | null = null;
  @Input() placeholder: string = 'Select an anime...';
  @Input() required: boolean = false;
  @Output() animeSelected = new EventEmitter<Anime | null>();

  anime: Anime[] = [];
  selectedAnime: Anime | null = null;
  loading = false;
  error: string | null = null;

  constructor(private animeService: AnimeService) {}

  ngOnInit(): void {
    this.loadAnime();
  }

  private loadAnime(): void {
    this.loading = true;
    this.error = null;

    this.animeService.getAllAnime(1, 100).subscribe({
      next: (anime) => {
        this.anime = anime.filter((a) => a.status === 'active');
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading anime:', error);
        this.error = 'Failed to load anime list';
        this.loading = false;
      },
    });
  }

  onAnimeChange(animeId: string): void {
    const selectedAnime = this.anime.find((a) => a.id === animeId) || null;
    this.selectedAnime = selectedAnime;
    this.animeSelected.emit(selectedAnime);
  }

  retryLoad(): void {
    this.loadAnime();
  }
}

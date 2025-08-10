import { Component, Input, OnInit } from '@angular/core';
import { Player } from '../../types/room';

@Component({
  selector: 'app-player-card',
  imports: [],
  templateUrl: './player-card.html',
  styleUrl: './player-card.css',
})
export class PlayerCard implements OnInit {
  @Input() player!: Player;

  backgroundColor: string = '';

  private colors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#96CEB4',
    '#FCEA2B',
    '#FF9FF3',
    '#54A0FF',
    '#5F27CD',
    '#00D2D3',
    '#FF9F43',
    '#F368E0',
    '#FF3838',
    '#2ED573',
    '#3742FA',
    '#F1C40F',
  ];

  ngOnInit() {
    this.backgroundColor = this.getRandomColor();
  }

  getInitials(): string {
    return this.player.name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2); // Limit to 2 characters
  }

  private getRandomColor(): string {
    const randomIndex = Math.floor(Math.random() * this.colors.length);
    return this.colors[randomIndex];
  }
}

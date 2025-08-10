import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { HowToPlay } from './pages/how-to-play/how-to-play';

export const routes: Routes = [
  {
    component: Home,
    path: '',
  },
  {
    component: HowToPlay,
    path: 'how-to-play',
  },
];

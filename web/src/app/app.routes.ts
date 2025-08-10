import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home';
import { HowToPlay } from './pages/how-to-play/how-to-play';
import { RoomPage } from './pages/room/room';

export const routes: Routes = [
  {
    component: HomePage,
    path: '',
  },
  {
    component: HowToPlay,
    path: 'how-to-play',
  },
  {
    component: RoomPage,
    path: 'room',
  },
];

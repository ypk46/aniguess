import { Router } from 'express';
import { AnimeController } from '../controllers/anime.controller';

const router = Router();
const animeController = new AnimeController();

// GET /api/anime - Get all anime with pagination
router.get('/', animeController.getAllAnime);

// GET /api/anime/:id - Get anime by ID
router.get('/:id', animeController.getAnimeById);

// POST /api/anime - Create new anime
router.post('/', animeController.createAnime);

// PUT /api/anime/:id - Update anime
router.put('/:id', animeController.updateAnime);

// DELETE /api/anime/:id - Delete anime
router.delete('/:id', animeController.deleteAnime);

export { router as animeRoutes };

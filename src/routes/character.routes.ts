import { Router } from 'express';
import { CharacterController } from '../controllers/character.controller';

const router = Router();
const characterController = new CharacterController();

// GET /api/characters - Get all characters with pagination
router.get('/', characterController.getAllCharacters);

// GET /api/characters/:id - Get character by ID
router.get('/:id', characterController.getCharacterById);

// GET /api/characters/anime/:animeId - Get characters by anime ID
router.get('/anime/:animeId', characterController.getCharactersByAnimeId);

// POST /api/characters - Create new character
router.post('/', characterController.createCharacter);

// PUT /api/characters/:id - Update character
router.put('/:id', characterController.updateCharacter);

// DELETE /api/characters/:id - Delete character
router.delete('/:id', characterController.deleteCharacter);

export { router as characterRoutes };

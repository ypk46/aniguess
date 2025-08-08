import { Router } from 'express';
import { AttributeController } from '../controllers/attribute.controller';

const router = Router();
const attributeController = new AttributeController();

// GET /api/attributes - Get all attributes with pagination
router.get('/', attributeController.getAllAttributes);

// GET /api/attributes/:id - Get attribute by ID
router.get('/:id', attributeController.getAttributeById);

// GET /api/attributes/anime/:animeId - Get attributes by anime ID
router.get('/anime/:animeId', attributeController.getAttributesByAnimeId);

// POST /api/attributes - Create new attribute
router.post('/', attributeController.createAttribute);

// PUT /api/attributes/:id - Update attribute
router.put('/:id', attributeController.updateAttribute);

// DELETE /api/attributes/:id - Delete attribute
router.delete('/:id', attributeController.deleteAttribute);

export { router as attributeRoutes };

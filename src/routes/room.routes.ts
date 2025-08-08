import { Router } from 'express';
import { RoomController } from '../controllers/room.controller';

const router = Router();
const roomController = new RoomController();

// POST /api/rooms - Create new room
router.post('/', roomController.createRoom);

// GET /api/rooms/:code - Get room by code
router.get('/:code', roomController.getRoomByCode);

// POST /api/rooms/:code/join - Join room
router.post('/:code/join', roomController.joinRoom);

// POST /api/rooms/:code/leave - Leave room
router.post('/:code/leave', roomController.leaveRoom);

export { router as roomRoutes };

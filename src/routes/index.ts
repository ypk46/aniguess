import { Router, Request, Response } from 'express';
import { healthController } from '../controllers/health';
import { ErrorResponse } from '../types/responses/common';

/**
 * Register all application routes.
 * @returns {Router} The configured router.
 */
export function createRoutes(): Router {
  const router = Router();

  // Health routes
  router.get('/health', healthController.getHealthStatus);
  router.get('/ping', healthController.ping);

  // 404 handler for unmatched routes
  router.use('*', (req: Request, res: Response): void => {
    const notFoundResponse: ErrorResponse = {
      status: 'NOT_FOUND',
      message: 'Endpoint not found',
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
    };

    res.status(404).json(notFoundResponse);
  });

  return router;
}

export const routes = createRoutes();

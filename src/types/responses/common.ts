/**
 * Common response interfaces used across multiple controllers
 */

export interface ErrorResponse {
  status: 'ERROR' | 'NOT_FOUND';
  message: string;
  path?: string;
  timestamp: string;
}

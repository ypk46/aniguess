/**
 * Common response interfaces used across multiple controllers
 */

export interface ErrorResponse {
  status: 'ERROR' | 'NOT_FOUND';
  message: string;
  path?: string;
  timestamp: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  result?: T;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  result: T[];
  page: number;
  perPage: number;
  total: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  result: T;
  message: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  page: number;
  perPage: number;
  total: number;
}

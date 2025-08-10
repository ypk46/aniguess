export interface Anime {
  id: string;
  title: string;
  imageUrl?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  result?: T;
  message?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  page: number;
  perPage: number;
  total: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
}

export type PaginatedResponse<T> = ApiResponse<{
  items: T[];
  pagination: Pagination;
}>;

/**
 * A successful response returned by a service.
 * Keep cross-application contracts here so web and API code agree on shapes.
 */
export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

/** A standard error shape suitable for HTTP and client-side handling. */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/** Pagination metadata shared by list endpoints and their clients. */
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
}

export type PaginatedResponse<T> = ApiResponse<{
  items: T[];
  pagination: Pagination;
}>;

export interface SampleItem {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  data: T;
}

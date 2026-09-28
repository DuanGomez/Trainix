export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: {
    statusCode: number;
    message: string | string[];
    path: string;
    timestamp: string;
  };
}

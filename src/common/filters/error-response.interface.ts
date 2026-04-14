export interface ErrorResponse {
  success: false;
  data: null;
  message: string | string[];
  statusCode: number;
  timestamp: string;
  path: string;
  errorCode?: string;
}

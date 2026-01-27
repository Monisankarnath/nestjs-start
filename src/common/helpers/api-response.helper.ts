export interface ErrorDetails {
  field: string;
  message: string;
}

export interface IApiResponse<T> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
    details: ErrorDetails[] | null;
  } | null;
  timestamp: string;
}

export class ApiResponse {
  static success<T>(data: T): IApiResponse<T> {
    return {
      success: true,
      data,
      error: null,
      timestamp: new Date().toISOString(),
    };
  }

  static error(
    code: string,
    message: string,
    details: ErrorDetails[] | null = null,
  ): IApiResponse<null> {
    return {
      success: false,
      data: null,
      error: { code, message: message, details },
      timestamp: new Date().toISOString(),
    };
  }
}

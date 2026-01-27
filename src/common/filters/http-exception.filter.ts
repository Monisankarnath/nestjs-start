import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse, ErrorDetails } from '../helpers/api-response.helper';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let errorCode = 'API_ERROR';
    let message = exception.message;
    let details: ErrorDetails[] | null = null;

    if (
      status === 400 &&
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse &&
      Array.isArray((exceptionResponse as any).message)
    ) {
      errorCode = 'VALIDATION_ERROR';
      message = 'Invalid form data';
      details = (exceptionResponse as any).message;
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
    ) {
      message = (exceptionResponse as any).message;
    }
    response
      .status(status)
      .json(ApiResponse.error(errorCode, message, details));
  }
}

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse, IApiResponse } from '../helpers/api-response.helper';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  IApiResponse<T>
> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<IApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        return ApiResponse.success(data);
      }),
    );
  }
}

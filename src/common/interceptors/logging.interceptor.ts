import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // --- PRE-CONTROLLER LOGIC ---
    // This runs BEFORE your Service/Controller

    const now = Date.now();
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    this.logger.log(`Incoming Request: ${method} ${url}`);

    return next
      .handle() // <--- This triggers the Controller
      .pipe(
        // --- POST-CONTROLLER LOGIC ---
        // 'tap' looks at the data but doesn't change it (unlike 'map')
        tap(() => {
          const delay = Date.now() - now;
          this.logger.log(`Request processed in ${delay}ms`);
        }),
      );
  }
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.setGlobalPrefix('api/v1');
  app.useGlobalInterceptors(new LoggingInterceptor());

  // 1. Validation Pipe: Formats errors into [{ field, message }]
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const formatedErrors = errors.map((error) => ({
          field: error.property,
          message: Object.values(error.constraints || {})[0],
        }));

        return new BadRequestException(formatedErrors);
      },
    }),
  );
  // 2. Global Filter: Handles Errors (400, 404, 500)
  app.useGlobalFilters(new HttpExceptionFilter());

  // 3. Global Interceptor: Handles Success (200, 201)
  app.useGlobalInterceptors(new TransformInterceptor());

  const config = new DocumentBuilder()
    .setTitle('NestJS Masterclass API')
    .setDescription('The social media API description')
    .setVersion('1.0')
    .addBearerAuth() // 👈 Enables the "Authorize" button for JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);
  // This creates the website at: http://localhost:3000/api
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();

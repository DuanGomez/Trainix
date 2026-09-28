import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port', 3000);
  const prefix = configService.get<string>('app.apiPrefix', 'api/v1');

  // Security
  app.use(helmet());
  app.use(compression());
  app.enableCors({
    origin: configService.get<string>('app.frontendUrl', 'http://localhost:4200'),
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix(prefix);

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global interceptors & filters
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger
  if (configService.get<string>('app.nodeEnv') !== 'production') {
    setupSwagger(app, prefix);
  }

  await app.listen(port);
  console.log(`🚀 Trainix API corriendo en: http://localhost:${port}/${prefix}`);
  console.log(`📚 Swagger disponible en:    http://localhost:${port}/docs`);
}

bootstrap();

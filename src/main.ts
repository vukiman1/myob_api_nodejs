import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { setupSwagger } from './setup-swagger';
import { Logger, UnprocessableEntityException, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/exceptions/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger:  ['warn', 'error'],
  });


  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: { enableImplicitConversion: true },
      stopAtFirstError: true,
      // exceptionFactory: errors =>
      //   new UnprocessableEntityException(
      //     errors.map((e) => {
      //       const rule = Object.keys(e.constraints!)[0]
      //       const msg = e.constraints![rule]
      //       return msg
      //     })[0],
      //   ),
    }),
  )


  const configService = app.get<ConfigService>(ConfigService);
  setupSwagger(app, configService)
  

  const {baseUrl, port, globalPrefix } = configService.get('app')
  app.setGlobalPrefix(globalPrefix)
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors();
  await app.listen(port, async () => {
    const logger = new Logger('App Port')
      logger.warn(`Server running on ${baseUrl}:${port}/${globalPrefix}`)
  });
}
bootstrap();

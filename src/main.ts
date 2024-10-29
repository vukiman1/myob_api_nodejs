import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { setupSwagger } from './setup-swagger';
import { Logger, UnprocessableEntityException, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


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
  await app.listen(port, async () => {

    const logger = new Logger('App Port')
      logger.log(`Server running on ${baseUrl}:${port}/${globalPrefix}`)
  });
}
bootstrap();

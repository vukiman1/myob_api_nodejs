import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { setupSwagger } from './setup-swagger';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);




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

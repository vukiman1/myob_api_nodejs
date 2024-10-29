import { INestApplication, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'


import {  IAppConfig, ISwaggerConfig } from './configs/index'


export function setupSwagger(
  app: INestApplication,
  configService: ConfigService,
): void {
  const { name, port, baseUrl, globalPrefix } = configService.get<IAppConfig>('app')!
  const { enable, path } = configService.get<ISwaggerConfig>('swagger')!

  if (!enable)
    return

  const documentBuilder = new DocumentBuilder()
    .setTitle(name)
    .addServer(`${baseUrl}:${port}/${globalPrefix}`)
    .setDescription(`${name} API document`)
    .setVersion('1.0')

  // auth security

//   documentBuilder.addSecurity(API_SECURITY_AUTH, {
//     description: '输入令牌（Enter the token）',
//     type: 'http',
//     scheme: 'bearer',
//     bearerFormat: 'JWT',
//   })

  const document = SwaggerModule.createDocument(app, documentBuilder.build(), {
    // ignoreGlobalPrefix: false,
    // extraModels: [CommonEntity, ResOp, Pagination, TreeResult],
  })

  SwaggerModule.setup(path, app, document, {
    swaggerOptions: {
      persistAuthorization: true, 
    },
  })

  // started log
  const logger = new Logger('SwaggerModule')
  logger.log(`Document is running on ${baseUrl}:${port}/${path}`)
}

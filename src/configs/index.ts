import { AppConfig, appRegToken, IAppConfig } from './app.config';
import { DatabaseConfig, dbRegToken, IDatabaseConfig } from './database.config';
import { ISwaggerConfig, SwaggerConfig, swaggerRegToken } from './swagger.config';

export * from './app.config'
export * from './swagger.config'
export * from './database.config'

export interface AllConfigType {
    [appRegToken]: IAppConfig,
    [swaggerRegToken]: ISwaggerConfig,
    [dbRegToken]: IDatabaseConfig
}


// Define RecordNamePaths type if it's not imported from somewhere else
type RecordNamePaths<T> = {
    [K in keyof T]: K extends string ? K : never
}[keyof T]


export type ConfigKeyPaths = RecordNamePaths<AllConfigType>


export default {
    AppConfig,
    DatabaseConfig,
    SwaggerConfig
};
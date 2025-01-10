import { ConfigType, registerAs } from '@nestjs/config'


import { DataSource, DataSourceOptions } from 'typeorm'

import { env, envBoolean, envNumber } from '../global/env'
import { User } from 'src/modules/user/entities/user.entity'
import { JobSeekerProfile } from 'src/modules/info/entities/job_seeker_profle.entities'



const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: env('DB_HOST', 'localhost'),
  port: envNumber('DB_PORT', 5432),
  username: env('DB_USERNAME', 'postgres'),
  password: env('DB_PASSWORD', 'kiman0102'),
  database: env('DB_DATABASE', 'MyJobAPI'),
  synchronize: envBoolean('DB_SYNCHRONIZE', false),
  ssl: {
    rejectUnauthorized: false, // Nếu bạn không có chứng chỉ SSL hợp lệ
  },
  // entities: [User, JobSeekerProfile],
//   migrations: ['dist/migrations/*{.ts,.js}'],
}
export const dbRegToken = 'database'

export const DatabaseConfig = registerAs(
  dbRegToken,
  (): DataSourceOptions => dataSourceOptions,
)


export type IDatabaseConfig = ConfigType<typeof DatabaseConfig>

const dataSource = new DataSource(dataSourceOptions)

export default dataSource

import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import lineworksAccessToken from '../entity/lineworksAccessToken';

// TODO envから取得
const dbConfig: PostgresConnectionOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false,
  logging: false,
  entities: [lineworksAccessToken],
};
export default dbConfig;

import { createConnection } from 'typeorm';
import dbConfig from './config';

export const init = async () => {
  createConnection(dbConfig)
    .then(async connection => {
      // TODO リリース時外す
      await connection.dropDatabase();
      await connection.synchronize();
    })
    .catch(error => {
      console.error('Postgres Connection Failed : ' + error.message);
    });
};

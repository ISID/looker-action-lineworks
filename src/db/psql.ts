import { createConnection } from 'typeorm';
import dbConfig from './config';

export const init = async () => {
  createConnection(dbConfig)
    .then(async connection => {
      await connection.dropDatabase();
      await connection.synchronize();
      console.log("success synchronize");
    })
    .catch(error => {
      console.error('Postgres Connection Failed : ' + error.message);
    });
};

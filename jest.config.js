module.exports = {
  roots: ['<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  globals: {
    SECRET_TOKEN: 'SECRET_TOKEN',
    LINEWORKS_API_ID: 'LINEWORKS API ID',
    LINEWORKS_CONSUMER_KEY: 'LINEWORKS Consumer Key',
    LINEWORKS_SERVER_ID: 'LINEWORKS Server ID',
    LINEWORKS_SERVER_AUTH_KEY: 'LINEWORKS Server Authentication Key',
    LINEWORKS_BOT_NO: 'LINEWORKS Bot No.',
  },
};

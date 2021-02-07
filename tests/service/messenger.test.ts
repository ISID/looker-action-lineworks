// test target
import { Messenger, Column, Message } from '../../src/service/messenger';

import fetch from 'node-fetch';
import * as csvParse from 'csv-parse';
import { LineworksAccessTokenController } from '../../src/controller/lineworksAccessTokenController';

import * as fs from 'fs';
import * as path from 'path';

jest.mock('node-fetch');
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
const { Response } = jest.requireActual('node-fetch');

jest.mock('../../src/controller/lineworksAccessTokenController');
const mockLATC = LineworksAccessTokenController as jest.Mock;

describe('fail : miss columns', () => {
  const message: Message = {
    line: 'line_message',
    lineworks: 'lineworks_message',
  };

  beforeEach(() => {
    mockLATC.mockImplementationOnce(() => {
      return {
        constructor: () => {},
        getValidAccessToken: async (): Promise<string> => {
          return 'test_accessToken';
        },
        forceGetValidAccessToken: async (): Promise<string> => {
          return 'test_force_accessToken';
        },
      };
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('fail : column lineworksid Error', done => {
    const testMessenger = new Messenger();
    const parser = csvParse({
      delimiter: '\t',
      columns: true,
    });
    const column: Column = {
      lineworksId: 'testtest1',
      lineId: 'test2',
      lineName: 'test3',
    };

    let isSkip: boolean = false;
    parser.on('readable', async () => {
      if (!isSkip) {
        isSkip = true;
        await expect(testMessenger.sendMessages(column, message, parser)).rejects.toThrowError('集計データに testtest1 列がありません。');
        done();
      }
    });
    const stream = fs.createReadStream(path.join(__dirname, '../asset/test.txt'), 'utf8');

    stream.pipe(parser);
  });

  test('fail : column lineid Error', done => {
    const testMessenger = new Messenger();
    const parser = csvParse({
      delimiter: '\t',
      columns: true,
    });
    const column: Column = {
      lineworksId: 'test1',
      lineId: 'testtest2',
      lineName: 'test3',
    };

    let isSkip: boolean = false;
    parser.on('readable', async () => {
      if (!isSkip) {
        isSkip = true;
        await expect(testMessenger.sendMessages(column, message, parser)).rejects.toThrowError('集計データに testtest2 列がありません。');
        done();
      }
    });
    const stream = fs.createReadStream(path.join(__dirname, '../asset/test.txt'), 'utf8');

    stream.pipe(parser);
  });

  test('fail : column lineName Error', done => {
    const testMessenger = new Messenger();
    const parser = csvParse({
      delimiter: '\t',
      columns: true,
    });
    const column: Column = {
      lineworksId: 'test1',
      lineId: 'test2',
      lineName: 'testtest3',
    };

    let isSkip: boolean = false;
    parser.on('readable', async () => {
      if (!isSkip) {
        isSkip = true;
        await expect(testMessenger.sendMessages(column, message, parser)).rejects.toThrowError('集計データに testtest3 列がありません。');
        done();
      }
    });
    const stream = fs.createReadStream(path.join(__dirname, '../asset/test.txt'), 'utf8');

    stream.pipe(parser);
  });
});

describe('send message', () => {
  const message: Message = {
    line: 'line_message',
    lineworks: 'lineworks_message',
  };

  const column: Column = {
    lineworksId: 'test1',
    lineId: 'test2',
    lineName: 'test3',
  };

  beforeEach(() => {
    mockLATC.mockImplementation(() => {
      return {
        constructor: () => {},
        getValidAccessToken: async (): Promise<string> => {
          return 'test_accessToken';
        },
        forceGetValidAccessToken: async (): Promise<string> => {
          return 'test_force_accessToken';
        },
      };
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('success ', done => {
    const testMessenger = new Messenger();
    const parser = csvParse({
      delimiter: '\t',
      columns: true,
    });

    mockFetch.mockReturnValue(Promise.resolve(new Response('test')));

    let isSkip: boolean = false;
    parser.on('readable', async () => {
      if (!isSkip) {
        isSkip = true;
        await expect(testMessenger.sendMessages(column, message, parser)).resolves.toStrictEqual({ msgCount: 1, sendCount: 1 });
        done();
      }
    });
    const stream = fs.createReadStream(path.join(__dirname, '../asset/test.txt'), 'utf8');

    stream.pipe(parser);
  });

  test('fail : fetch error ', done => {
    const testMessenger = new Messenger();
    const parser = csvParse({
      delimiter: '\t',
      columns: true,
    });

    mockFetch.mockImplementationOnce(() => {
      throw new Error('error');
    });

    let isSkip: boolean = false;
    parser.on('readable', async () => {
      if (!isSkip) {
        isSkip = true;
        await expect(testMessenger.sendMessages(column, message, parser)).rejects.toThrowError('error');
        done();
      }
    });
    const stream = fs.createReadStream(path.join(__dirname, '../asset/test.txt'), 'utf8');

    stream.pipe(parser);
  });

  test('fail : return 400 ', done => {
    const testMessenger = new Messenger();
    const parser = csvParse({
      delimiter: '\t',
      columns: true,
    });

    mockFetch.mockReturnValue(Promise.resolve(new Response(JSON.stringify({ status: 400,
      message:"test"
    }), { status: 400,
    } )));

    let isSkip: boolean = false;
    parser.on('readable', async () => {
      if (!isSkip) {
        isSkip = true;
        await expect(testMessenger.sendMessages(column, message, parser)).rejects.toThrowError(
          'メッセージ送信APIからエラーコード(400)が返却されました。: test'
        );
        done();
      }
    });
    const stream = fs.createReadStream(path.join(__dirname, '../asset/test.txt'), 'utf8');

    stream.pipe(parser);
  });
});

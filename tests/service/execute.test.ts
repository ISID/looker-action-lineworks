// target
import * as execute from '../../src/service/execute';
import Express from 'express';
import fetch from 'node-fetch';
// import * as csvParse from 'csv-parse';
import { Messenger } from '../../src/service/messenger';
import { Logger } from '../../src/utils/logger';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('node-fetch');
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
const { Response } = jest.requireActual('node-fetch');

jest.mock('../../src/service/messenger');
const mockMessenger = Messenger as jest.Mock;

jest.mock('../../src/utils/logger');
const mockLogger = Logger as jest.Mock;

describe('fail : validation error', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('missing form_params', () => {
    const req = {
      body: {
        // form_params: {
        //   lineworks_message: 'lineworks_test',
        //   line_message: 'line_test',
        // },
      },
    } as Express.Request;
    // test
    return expect(execute.handler(req)).rejects.toThrow('必須項目が入力されていません。');
  });

  test('missing lineworks_message', () => {
    const req = {
      body: {
        form_params: {
          //   lineworks_message: 'lineworks_test',
          line_message: 'line_test',
        },
      },
    } as Express.Request;
    // test
    return expect(execute.handler(req)).rejects.toThrow('LINEWORKSユーザへのメッセージが入力されていません');
  });

  test('over lineworks_message limit', () => {
    const req = {
      body: {
        form_params: {
          lineworks_message: 'lineworks_test_over_100_lineworks_test_over_100_lineworks_test_over_100_lineworks_test_over_100_linew',
          line_message: 'line_test',
        },
      },
    } as Express.Request;
    // test
    return expect(execute.handler(req)).rejects.toThrow('LINEWORKSユーザへのメッセージが100文字を超えています。');
  });

  test('missing line_message', () => {
    const req = {
      body: {
        form_params: {
          lineworks_message: 'lineworks_test',
          // line_message: 'line_test',
        },
      },
    } as Express.Request;
    // test
    return expect(execute.handler(req)).rejects.toThrow('LINEユーザへのメッセージテンプレートが入力されていません。');
  });

  test('over line_message limit', () => {
    const req = {
      body: {
        form_params: {
          lineworks_message: 'lineworks_test',
          line_message: 'line_test_over_75_line_test_over_75_line_test_over_75_line_test_over_75_line',
        },
      },
    } as Express.Request;
    // test
    return expect(execute.handler(req)).rejects.toThrow('LINEユーザへのメッセージテンプレートが75文字を超えています。');
  });
});

describe('message test', () => {
  const req = {
    body: {
      form_params: {
        lineworks_message: 'lineworks_test',
        line_message: 'line_test',
      },
      scheduled_plan: {
        scheduled_plan_id: '0',
        download_url: 'https://test.test',
      },
      data: {
        lineworks_id: 'lineworks_id_test',
        line_id: 'line_id_test',
        line_name: 'line_name_test',
      },
    },
  } as Express.Request;

  mockLogger.mockImplementation(() => {
    return {
      info: (message: string) => {
        return 'info';
      },
      error: (message: string) => {
        return 'error';
      },
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('success', async () => {
    const stream = fs.createReadStream(path.join(__dirname, '../asset/test.csv'), 'utf8');
    mockFetch.mockReturnValue(Promise.resolve(new Response(stream)));

    mockMessenger.mockImplementationOnce(() => {
      return {
        constructor: () => {
          return new Messenger();
        },
        sendMessages: async (column: any, message: any, parser: any): Promise<any> => {
          return {
            sendCount: 0,
            msgCount: 0,
          };
        },
      };
    });

    // test
    return expect(execute.handler(req)).resolves.toBe(undefined);
  });

  test('fail : fetch csv', () => {
    mockFetch.mockImplementation(() => {
      throw new Error('test');
    });

    // test
    return expect(execute.handler(req)).rejects.toThrowError('test');
  });

  // test('fail : send message error', () => {
  //   const stream = fs.createReadStream(path.join(__dirname, '../asset/test.csv'), 'utf8');
  //   mockFetch.mockReturnValue(Promise.resolve(new Response(stream)));

  //   mockMessenger.mockImplementationOnce(() => {
  //     return {
  //       constructor: () => {
  //         return new Messenger();
  //       },
  //       sendMessages: async (column: any, message: any, parser: any): Promise<any> => {
  //         throw new Error('test');
  //       },
  //     };
  //   });

  //   // test
  //   execute.handler(req);
  //   return expect(execute.handler(req)).rejects.toThrowError();
  // });
});

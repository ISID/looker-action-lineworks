// todo refine
import * as request from 'supertest';
import * as list from '../src/service/list';
import * as execute from '../src/service/execute';
import * as form from '../src/service/form';

// test target
import app from '../src/app';
import { Logger } from '../src/utils/logger';

// mock
jest.mock('../src/service/list');
const mockList = list.handler as jest.Mock;

jest.mock('../src/service/form');
const mockForm = form.handler as jest.Mock;

jest.mock('../src/service/execute');
const mockExeute = execute.handler as jest.Mock;

jest.mock('../src/utils/logger');
const mockLogger = Logger as jest.Mock;

process.env.SECRET_TOKEN = 'test';

describe('success case', () => {
  beforeEach(() => {
    jest.mock('request', () => {
      return {
        body: {
          scheduled_plan: {
            scheduled_plan_id: '1',
          },
        },
      };
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('list', async () => {
    mockList.mockResolvedValue({ test: 'test' });
    const result = await request(app)
      .post('/')
      .set('Authorization', 'Token token="test"');
    expect(result.body.test).toBe('test');
    expect(result.status).toBe(200);
  });

  test('form', async () => {
    mockForm.mockResolvedValue({ test: 'test' });
    const result = await request(app)
      .post('/form')
      .set('Authorization', 'Token token="test"');
    expect(result.body.test).toBe('test');
    expect(result.status).toBe(200);
  });

  test('execute', async () => {
    mockExeute.mockResolvedValue('test');
    const result = await request(app)
      .post('/execute')
      .set('Authorization', 'Token token="test"')
      .send({
        scheduled_plan: {
          scheduled_plan_id: 1,
        },
      });
    expect(result.status).toBe(200);
  });
});

describe('failure case', () => {
  it('throw Error in execute', async () => {
    const spyLogger = jest.spyOn(mockLogger.prototype, 'error').mockImplementationOnce(() => {});
    mockExeute.mockRejectedValue('test');
    const result = await request(app)
      .post('/execute')
      .set('Authorization', 'Token token="test"')
      .send({
        scheduled_plan: {
          scheduled_plan_id: 1,
        },
      });
    expect(result.status).toBe(400);
    expect(spyLogger).toHaveBeenCalled();
  });

  it('invalid Authorization', async () => {
    const spyLogger = jest.spyOn(mockLogger.prototype, 'error').mockImplementationOnce(() => {});
    const result = await request(app).post('/');
    expect(result.status).toBe(400);
    expect(spyLogger).toHaveBeenCalled();
  });
});

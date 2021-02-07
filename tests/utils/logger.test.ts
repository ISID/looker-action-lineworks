// test target
import { Logger } from '../../src/utils/logger';

const scheduledPlanId = 0;
const message = 'test';

describe('logger', () => {
  beforeAll(() => {
    Date.now = jest.fn(() => 1582305742000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('error', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const logger = new Logger(scheduledPlanId);
    logger.error(message);
    expect(consoleSpy).toHaveBeenCalledWith('"2020-02-21T17:22:22.000Z","0","ERROR","test"');
  });

  test('info', () => {
    const consoleSpy = jest.spyOn(console, 'info').mockImplementation();
    const logger = new Logger(scheduledPlanId);
    logger.info(message);
    expect(consoleSpy).toHaveBeenCalledWith('"2020-02-21T17:22:22.000Z","0","INFO","test"');
  });
});

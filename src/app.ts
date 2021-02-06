import * as Express from 'express';
import * as list from './service/list';
import * as execute from './service/execute';
import * as form from './service/form';
import { Logger } from './utils/logger';

const app = Express();

app.use(Express.json());
app.use(Express.urlencoded({ extended: true, limit: '50mb' }));
app.use((req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
  const logger = new Logger(0);
  if (req.get('Authorization') !== `Token token="${process.env.SECRET_TOKEN}"`) {
    logger.error('Authorization Code is incorrect');
    res.sendStatus(400);
    return;
  }
  next();
});

app.get('/', (req: Express.Request, res: Express.Response) => {
  return res.status(200).send('Hello World!');
});

app.post('/', async (req: Express.Request, res: Express.Response) => {
  const resBody = await list.handler(req);
  return res.status(200).send(resBody);
});

app.post('/execute', async (req: Express.Request, res: Express.Response) => {
  const logger = new Logger(req.body.scheduled_plan.scheduled_plan_id);
  let statuCode = 200;
  try {
    await execute.handler(req);
  } catch (e) {
    logger.error(e.message);
    statuCode = 400;
  }
  return res.sendStatus(statuCode);
});

app.post('/form', async (req: Express.Request, res: Express.Response) => {
  const resform = await form.handler(req);
  return res.status(200).send(resform);
});

export default app;

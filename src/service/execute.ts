import Express from 'express';
import fetch from 'node-fetch';
import * as csvParse from 'csv-parse';
import { Messenger } from './messenger';
import { Logger } from '../utils/logger';

export const handler = async (req: Express.Request) => {
  const reqBody = req.body;

  // validation
  if (!reqBody.form_params) {
    throw new Error('必須項目が入力されていません。');
  } else {
    if (!reqBody.form_params.lineworks_message) {
      throw new Error('LINEWORKSユーザへのメッセージが入力されていません。');
    } else if (reqBody.form_params.lineworks_message.length > 100) {
      throw new Error('LINEWORKSユーザへのメッセージが100文字を超えています。');
    }
    if (!reqBody.form_params.line_message) {
      throw new Error('LINEユーザへのメッセージテンプレートが入力されていません。');
    } else if (reqBody.form_params.line_message.length > 75) {
      throw new Error('LINEユーザへのメッセージテンプレートが75文字を超えています。');
    }
  }

  const logger = new Logger(reqBody.scheduled_plan.scheduled_plan_id);
  const messenger: Messenger = new Messenger();
  const url = reqBody.scheduled_plan.download_url;

  const column = {
    lineworksId: reqBody.data.lineworks_id,
    lineId: reqBody.data.line_id,
    lineName: reqBody.data.line_name,
  };

  const message = {
    lineworks: reqBody.form_params.lineworks_message,
    line: reqBody.form_params.line_message,
  };

  const parser = csvParse({
    delimiter: '\t',
    columns: true,
  });

  let isSkip: boolean = false;

  parser.on('readable', () => {
    if (!isSkip) {
      isSkip = true;
      messenger
        .sendMessages(column, message, parser)
        .then(result => {
          if (result.sendCount === result.msgCount) {
            logger.info(`[${result.sendCount}/${result.msgCount}]件のメッセージを送信しました。`);
          } else {
            logger.error(`[${result.sendCount}/${result.msgCount}]件のメッセージを送信しました。`);
          }
        })
        .catch(e => {
          throw new Error(e.message);
        });
    }
  });

  parser.on('error', err => {
    logger.error('集計データの読み込みでエラーが発生しました。');
    throw new Error(err.message);
  });

  const response = await fetch(url);
  response.body.pipe(parser);
};

import fetch from 'node-fetch';
import * as csvParse from 'csv-parse';
import { LineworksAccessTokenController } from '../controller/lineworksAccessTokenController';

// interface
export interface CustomerMessage {
  customerId: number;
  customerName: string;
}

export interface MessageData {
  [key: string]: CustomerMessage[];
}

export interface Column {
  lineworksId: string;
  lineId: string;
  lineName: string;
}

export interface Message {
  lineworks: string;
  line: string;
}

export class Messenger {
  private messagePushUrl: string;
  private consumerKey: string;
  private token?: string;

  constructor() {
    this.messagePushUrl = `https://apis.worksmobile.com/r/${process.env.LINEWORKS_API_ID}/message/v1/bot/${process.env.LINEWORKS_BOT_NO}/message/push`;
    this.consumerKey = process.env.LINEWORKS_CONSUMER_KEY || '';
  }

  sendMessages = async (column: Column, message: Message, parser: csvParse.Parser): Promise<{ sendCount: number; msgCount: number }> => {
    const lineworksAccessTokenController = new LineworksAccessTokenController();
    if (!this.token) {
      this.token = await lineworksAccessTokenController.getValidAccessToken();
    }

    let colLineworksId: string = '';
    let colLineId: string = '';
    let colLineName: string = '';
    const msgData: MessageData = {};
    let msgCount: number = 0;

    for await (const data of parser) {
      msgCount++;
      if (msgCount === 1) {
        for (const col in data) {
          if (col.substr(-column.lineworksId.length) === column.lineworksId) {
            colLineworksId = col;
          } else if (col.substr(-column.lineId.length) === column.lineId) {
            colLineId = col;
          } else if (col.substr(-column.lineName.length) === column.lineName) {
            colLineName = col;
          }
        }
        if (!colLineworksId) {
          throw new Error(`集計データに ${column.lineworksId} 列がありません。`);
        }
        if (!colLineId) {
          throw new Error(`集計データに ${column.lineId} 列がありません。`);
        }
        if (!colLineName) {
          throw new Error(`集計データに ${column.lineName} 列がありません。`);
        }
      }

      let customerList = msgData[data[colLineworksId]];
      if (!customerList) {
        customerList = [];
        msgData[data[colLineworksId]] = customerList;
      }

      // lineNameが20文字を超えていた場合、20文字に切り下げを行い末尾に「...」を入れる処理
      const customerName = data[colLineName].length > 10 ? data[colLineName].slice(0, 9) + '…' : data[colLineName];
      customerList.push({ customerId: data[colLineId], customerName: customerName });
    }

    let sendCount = 0;

    for (const member in msgData) {
      const customerList = msgData[member];
      const tmpCustomerList = this.arrayChunk(customerList, 10);

      for (const customerList of tmpCustomerList) {
        sendCount += customerList.length;
        await this.messagePush(member, customerList, message);
        await this.sleep(500);
      }
    }
    return { sendCount: sendCount, msgCount: msgCount };
  };

  private messagePush = async (
    member: string,
    customers: Array<{ customerId: number; customerName: string }>,
    message: { lineworks: string; line: string }
  ) => {
    const actions = [];
    for (const customer of customers) {
      actions.push({
        type: 'uri',
        label: customer.customerName + '様へメッセージを送る',
        uri: 'lineworks://message/send?version=15&message=' + encodeURI(message.line) + '&worksAtIdList=' + customer.customerId,
      });
    }
    const body = {
      accountId: member,
      content: {
        type: 'button_template',
        contentText: message.lineworks,
        actions: actions,
      },
    };
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        consumerKey: this.consumerKey,
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify(body),
    };

    const response = await fetch(this.messagePushUrl, options);

    if (!response.ok) {
      if (response.status === 401 || response.statusText === 'Authentication failed') {
        const lineworksAccessTokenController = new LineworksAccessTokenController();
        this.token = await lineworksAccessTokenController.forceGetValidAccessToken();
        this.messagePush(member, customers, message);
      } else {
        const resBody = await response.json();
        throw new Error(`メッセージ送信APIからエラーコード(${response.status})が返却されました。: ${resBody.message}`);
      }
    }
  };

  private arrayChunk = ([...array], size = 1) => {
    return array.reduce((acc, value, index) => (index % size ? acc : [...acc, array.slice(index, index + size)]), []);
  };

  private sleep = (msec: number) => new Promise(resolve => setTimeout(resolve, msec));
}

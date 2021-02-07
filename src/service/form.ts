import Express from 'express';

export const handler = async (req: Express.Request) => {
  const response = [];
  response.push({
    type: 'textarea',
    description: 'LINEWORKSユーザへのメッセージを100文字以内で入力してください。',
    name: 'lineworks_message',
    label: 'LINEWORKSユーザへのメッセージ',
    required: true,
  });
  response.push({
    type: 'textarea',
    description: 'LINEユーザへのメッセージテンプレートを75文字以内入力してください。',
    name: 'line_message',
    label: 'LINEユーザへのメッセージテンプレート',
    required: true,
  });

  return response;
};

require('dotenv').config();
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const FORWARD_TO = process.env.TO_USER_ID;

const saveMessage = (msg) => {
  const filePath = './messages.json';
  const messages = fs.existsSync(filePath)
    ? JSON.parse(fs.readFileSync(filePath, 'utf8'))
    : [];

  messages.push({
    date: new Date().toISOString(),
    from: msg.from.username || msg.from.id,
    type: msg.text ? 'text' : 'non-text',
    content: msg.text || '[media]',
  });

  fs.writeFileSync(filePath, JSON.stringify(messages, null, 2));
};


bot.on('message', async (msg) => {
  const chatId = msg.chat.id;


  saveMessage(msg);


  try {
    await bot.forwardMessage(FORWARD_TO, chatId, msg.message_id);
  } catch (error) {
    console.error('Ошибка пересылки:', error);
  }
});

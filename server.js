const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN;
const TO_USER_ID = process.env.TO_USER_ID;
const BASE_URL = process.env.RENDER_EXTERNAL_URL;

if (!BOT_TOKEN || !TO_USER_ID || !BASE_URL) {
  console.error('❌ Отсутствует одна из переменных окружения: BOT_TOKEN, TO_USER_ID, RENDER_EXTERNAL_URL');
  process.exit(1);
}


const bot = new TelegramBot(BOT_TOKEN, { webHook: true });

const WEBHOOK_PATH = `/bot${BOT_TOKEN}`;
const WEBHOOK_URL = `${BASE_URL}${WEBHOOK_PATH}`;

bot.setWebHook(WEBHOOK_URL)
  .then(() => console.log(`✅ Webhook установлен: ${WEBHOOK_URL}`))
  .catch(err => console.error('❌ Ошибка установки Webhook:', err.message));

app.post(WEBHOOK_PATH, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

bot.on('message', async msg => {
  try {
    await bot.forwardMessage(TO_USER_ID, msg.chat.id, msg.message_id);
    console.log(`📩 Переслано сообщение от ${msg.chat.id}`);
  } catch (err) {
    console.error('❌ Ошибка при пересылке сообщения:', err.message);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});

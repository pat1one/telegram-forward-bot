const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

if (!process.env.BOT_TOKEN || !process.env.TO_USER_ID || !process.env.RENDER_EXTERNAL_URL) {
  console.error('❌ Одна из переменных окружения не настроена: BOT_TOKEN, TO_USER_ID или RENDER_EXTERNAL_URL');
  process.exit(1);
}

const bot = new TelegramBot(process.env.BOT_TOKEN, {
  webHook: { port: PORT }
});

const WEBHOOK_PATH = `/bot${process.env.BOT_TOKEN}`;
const WEBHOOK_URL = `${process.env.RENDER_EXTERNAL_URL}${WEBHOOK_PATH}`;

bot.setWebHook(WEBHOOK_URL)
  .then(() => console.log(`✅ Webhook установлен: ${WEBHOOK_URL}`))
  .catch(err => console.error('❌ Ошибка установки webhook:', err));

app.post(WEBHOOK_PATH, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

bot.on('message', async msg => {
  try {
    await bot.forwardMessage(process.env.TO_USER_ID, msg.chat.id, msg.message_id);
    console.log(`→ Переслано сообщение от ${msg.chat.id}`);
  } catch (err) {
    console.error('❌ Ошибка при пересылке:', err.message);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});

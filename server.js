const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const app = express();
app.use(express.json());

const bot = new TelegramBot(process.env.BOT_TOKEN, {
  webHook: {
    port: process.env.PORT || 3000
  }
});

const webhookUrl = `${process.env.RENDER_EXTERNAL_URL}/bot${process.env.BOT_TOKEN}`;
bot.setWebHook(webhookUrl);

app.post(`/bot${process.env.BOT_TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

bot.on('message', async (msg) => {
  const fromId = msg.chat.id;
  const toId = process.env.TO_USER_ID;

  if (toId) {
    try {
      await bot.forwardMessage(toId, fromId, msg.message_id);
      console.log(`Сообщение от ${fromId} переслано`);
    } catch (error) {
      console.error('Ошибка пересылки:', error.message);
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`🌐 Вебхук установлен: ${webhookUrl}`);
});


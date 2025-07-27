import os
import json
import logging
from telegram import Update
from telegram.ext import ApplicationBuilder, MessageHandler, ContextTypes, filters

BOT_TOKEN = os.getenv("BOT_TOKEN")
TARGET_USER = os.getenv("TARGET_USER")  # Example: @username

logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

if not BOT_TOKEN or not TARGET_USER:
    raise Exception("BOT_TOKEN and TARGET_USER must be set in environment variables.")

async def forward_and_save(update: Update, context: ContextTypes.DEFAULT_TYPE):
    msg = update.effective_message
    user = update.effective_user

    data = {
        "from_user": user.username or user.full_name,
        "message_id": msg.message_id,
        "text": msg.text or "",
        "chat_id": msg.chat.id,
        "date": msg.date.isoformat()
    }

    # Save to messages.json
    with open("messages.json", "a", encoding="utf-8") as f:
        f.write(json.dumps(data, ensure_ascii=False) + "\n")

    try:
        await context.bot.copy_message(
            chat_id=TARGET_USER,
            from_chat_id=msg.chat_id,
            message_id=msg.message_id
        )
    except Exception as e:
        logging.error(f"Failed to forward message: {e}")

if __name__ == "__main__":
    app = ApplicationBuilder().token(BOT_TOKEN).build()
    app.add_handler(MessageHandler(filters.ALL, forward_and_save))
    print("Bot started...")
    app.run_polling()

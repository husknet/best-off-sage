export async function sendTelegramMessage(message: string, mode: 'Markdown' | 'HTML' = 'HTML') {
  const botToken = process.env.VITE_TELEGRAM_BOT_TOKEN || import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  const chatId = process.env.VITE_TELEGRAM_CHAT_ID || import.meta.env.VITE_TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error('Missing Telegram bot token or chat ID');
    return;
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: mode // Make sure this matches your message format
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Telegram API error: ${error.description || response.statusText}`);
    }
  } catch (err) {
    console.error('Failed to send Telegram message:', err);
    throw err;
  }
}

export async function sendTelegramMessage(message: string, mode: 'Markdown' | 'HTML' = 'Markdown') {
  const botToken = process.env.VITE_TELEGRAM_BOT_TOKEN || import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  const chatId = process.env.VITE_TELEGRAM_CHAT_ID || import.meta.env.VITE_TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error('Missing Telegram bot token or chat ID');
    return;
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  // Sanitize message based on chosen parse mode
  const sanitizedMessage =
    mode === 'Markdown'
      ? message.replace(/<br\s*\/?>/gi, '\n') // Replace <br/> with newline for Markdown
      : message.replace(/<br\s*\/?>/gi, '<br>'); // Normalize <br/> to <br> for HTML

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: sanitizedMessage,
        parse_mode: mode
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

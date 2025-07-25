export async function sendTelegramMessage(message: string) {
  // Use process.env for server-side, fall back to import.meta.env for client-side
  const botToken = process.env.VITE_TELEGRAM_BOT_TOKEN || import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  const chatId = process.env.VITE_TELEGRAM_CHAT_ID || import.meta.env.VITE_TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error('Missing Telegram bot token or chat ID in environment variables.');
    return;
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    // Use node-fetch or similar for server-side compatibility
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Telegram API error: ${errorData.description || response.statusText}`);
    }
  } catch (err) {
    console.error('Failed to send Telegram message:', err);
    throw err; // Re-throw if you want calling code to handle the error
  }
}

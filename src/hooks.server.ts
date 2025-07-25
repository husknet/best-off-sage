import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

// Bot detection environment variables (middleware-specific)
const TELEGRAM_BOT_TOKEN = process.env.HOOK_TELID;
const TELEGRAM_CHAT_ID = process.env.HOOK_CHATID;

export const handle: Handle = async ({ event, resolve }) => {
  const path = event.url.pathname;

  // Skip checks for static assets and denial page
  if (
    path.startsWith('/_app') ||
    path.startsWith('/public') ||
    path === '/denied'
  ) {
    return resolve(event);
  }

  // Get IP and User Agent
  const ip =
    event.getClientAddress() ||
    event.request.headers.get('x-forwarded-for')?.split(',')[0] ||
    '0.0.0.0';

  const userAgent = event.request.headers.get('user-agent') || 'Unknown';

  try {
    // Call external bot detection API
    const res = await fetch('https://bad-defender-production.up.railway.app/api/detect_bot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip, user_agent: userAgent })
    });

    if (!res.ok) throw new Error(`API responded with ${res.status}`);

    const data = await res.json();
    const flags = data.details;

    const suspiciousFlags = {
      'Bot UA': flags.isBotUserAgent,
      'Scraper ISP': flags.isScraperISP,
      'IP Abuse': flags.isIPAbuser,
      'Traffic Spike': flags.isSuspiciousTraffic,
      'Data Center ASN': flags.isDataCenterASN
    };

    const triggeredReasons = Object.entries(suspiciousFlags)
      .filter(([_, val]) => val)
      .map(([key]) => key);

    if (triggeredReasons.length > 0) {
      const isp = flags?.isp || 'Unknown';
      const asn = flags?.asn || 'Unknown';

      const message = `
🚨 <b>Bot Blocked</b>
🔍 <b>IP:</b> ${ip}
🏢 <b>ISP:</b> ${isp}
🏷️ <b>ASN:</b> ${asn}
🧠 <b>Reason(s):</b> ${triggeredReasons.join(', ')}
🕵️‍♂️ <b>User-Agent:</b> ${userAgent}
`.trim();

      // Notify Telegram
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'HTML'
        })
      });

      // Redirect to /denied page
      throw redirect(302, '/denied');
    }
  } catch (err) {
    console.error('Bot detection failed:', err);
    throw redirect(302, '/denied');
  }

  // Proceed to requested page if clean
  return resolve(event);
};

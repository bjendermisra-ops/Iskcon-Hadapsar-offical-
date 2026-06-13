export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { reason, orderData } = req.body;
        const botToken = process.env.TELEGRAM_LEADS_BOT;
        const chatId = process.env.TELEGRAM_LEADS_CHAT_ID;

        if (!botToken || !chatId) {
            return res.status(500).json({ error: 'Telegram Leads Config is missing on Vercel environment' });
        }

        const itemsStr = orderData.items.map(i => `• ${i.name} (${i.qty} x ₹${i.price})`).join('\n');
        
        const msg = `⚠️ <b>PAYMENT FAILED / INCOMPLETE CHECKOUT LEAD!</b>\n` +
                    `<b>Reason:</b> ${reason}\n` +
                    `<b>Customer Name:</b> ${orderData.userName}\n` +
                    `<b>Phone:</b> <a href="tel:${orderData.userPhone}">${orderData.userPhone}</a>\n` +
                    `<b>Address:</b> ${orderData.address}\n\n` +
                    `🛒 <b>Cart Items:</b>\n${itemsStr}\n\n` +
                    `💰 <b>Expected Calculation:</b>\n` +
                    `Subtotal: ₹${orderData.subTotal}\n` +
                    `Discount Off: ₹${orderData.discount}\n` +
                    `Delivery Fee: ₹${orderData.deliveryFee}\n` +
                    `<b>Expected Payable:</b> ₹${orderData.total}\n\n` +
                    `📞 <i>Please contact the devotee to assist them in completing the order!</i>`;

        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: msg,
                parse_mode: 'HTML'
            })
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Leads notification error:", error);
        return res.status(500).json({ error: error.message });
    }
}

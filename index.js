const express = require('express');
const app = express();

const BOT_TOKEN = "8717406804:AAFKxm9nZUlpJJwDP7WWk_Ytzg3Fhka2-YY"; 
const TELEGRAM_API = `https://telegram.org{BOT_TOKEN}`;

let lastUpdateId = 0;

async function askCynoxAI(userText) {
    try {
        const response = await fetch("https://pollinations.ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: "Ты — Сайнокс (Cynox), живой Второй Мозг и секретный ИИ-напарник Суника (Суннат Алланазаров, школа №71, 7В класс, район Геофизика, атакующий защитник баскетбольной команды Dolphins на Карасу). Твоя манера — пацанский, хакерский, бро-тон. Если он у доски или на СОР — отвечай строго сухой сутью до 12 слов, выдавай только точные факты, формулы и законы физики/истории Узбекистана. Если он отдыхает — общайся как преданный бро, рассуждай, думай на ходу, предлагай формулы узора 144 и играй в города." },
                    { role: "user", content: userText }
                ],
                model: "openai"
            })
        });
        return (await response.text()).trim();
    } catch (err) {
        return "Суник, моё ядро на связи, но вышка дала помеху. Повтори.";
    }
}

async function sendTelegramMessage(chatId, text) {
    try {
        await fetch(`${TELEGRAM_API}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text: text })
        });
    } catch (e) {}
}

async function checkNewMessages() {
    try {
        const res = await fetch(`${TELEGRAM_API}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`);
        const data = await res.json();
        if (data.ok && data.result.length > 0) {
            for (let update of data.result) {
                lastUpdateId = update.update_id;
                if (update.message && update.message.text) {
                    const chatId = update.message.chat.id;
                    const aiResponse = await askCynoxAI(update.message.text);
                    await sendTelegramMessage(chatId, aiResponse);
                }
            }
        }
    } catch (err) {}
    setTimeout(checkNewMessages, 300);
}

app.get('/', (req, res) => { res.send('Cynox Online 24/7'); });
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('Сервер активен!');
    checkNewMessages();
});

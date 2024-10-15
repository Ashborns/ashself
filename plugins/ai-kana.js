import axios from 'axios';

let handler = async (m, { conn, usedPrefix, command, text }) => {
    if (!text) return m.reply('apacoba');
    m.reply('loading . . .');
    let loli = await kana(text, 'kamu adalah kanna dan kamu adalah asistenku');
    await conn.reply(m.chat, loli.data.result, m);
}

handler.help = handler.command = ['kana'];
handler.tags  = ['ai'];

export default handler;

async function kana(text, prompt) {
    const url = 'https://api.kyuurzy.tech/api/gpt/kana';
    const headers = {
        'accept': '*/*',
        'api_key': 'free',
        'Content-Type': 'application/json'
    };
    const body = {
        text,
        prompt
    };

    try {
        const response = await axios.post(url, body, { headers });
        return response.data;
    } catch (error) {
        console.error('Error making request:', error);
        throw error;
    }
}
import fs from 'fs';
const axios = require('axios');

// Fungsi untuk mendapatkan jawaban dari API
function sonu(q) {
    return new Promise(async (resolve, reject) => {
        try {
            const { data: res } = await axios({
                method: 'post',
                url: `https://so.nuu.su/api/search?q=${encodeURIComponent(q)}`,
                headers: {
                    'Accept': 'text/event-stream',
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36',
                    'Referer': `https://so.nuu.su/search?q=${encodeURIComponent(q)}`
                },
                data: {
                    "stream": true,
                    "model": "deepseek-chat",
                    "mode": "simple",
                    "language": "all",
                    "categories": ["general"],
                    "engine": "SEARXNG",
                    "locally": false,
                    "reload": false
                },
                responseType: 'json'
            });

            let answer = '';
            let regex = /\\"answer\\":\\"(.*?)\\"/g;
            let match;
            let references = [];
            let regex2 = /\\"url\\":\\"(.*?)\\",\\"source\\":\\"(.*?)\\",\\"img\\":\\"(.*?)\\",\\"snippet\\":\\"(.*?)\\"/g;
            let match2;

            while ((match = regex.exec(res)) !== null) {
                if (match[1] !== "null") {
                    answer += match[1];
                }
            }

            while ((match2 = regex2.exec(res)) !== null && references.length < 5) {
                let url = match2[1];
                let snippet = match2[4];
                let reference = `- ${snippet} source: [${url}]`;
                references.push(reference);
            }

            resolve(answer + '\n\nReferences: \n' + references.join("\n"));
        } catch (error) {
            reject(error);
        }
    });
}

let handler = async (m, { conn, text }) => {
    if (!text) {
        return conn.sendMessage(m.chat, 'Please provide a search query after the .sonu command.', 'conversation', { quoted: m });
    }
    
    try {
        const result = await sonu(text);
        await conn.sendMessage(m.chat, { image: { url: 'https://telegra.ph/file/39497eb26a44d30a9b190.jpg' }, caption: result }, m);
    } catch (error) {
        console.error(error);
        await conn.sendMessage(m.chat, 'An error occurred while fetching the data.', 'conversation', { quoted: m });
    }
};

handler.help = ['sonu'];
handler.tags = ['ai'];
handler.command = /^(sonu)$/i;

export default handler;
if (process.env.NODE_ENV === 'production') {
    console.log = function () {};
}

import SpicyAI from "../lib/spicyAI.js";

const spicyAI = new SpicyAI('./database/spicyAI.json');

let handler = async (m, { conn, text, isOwner }) => {
    if (!text) throw `*Contoh:* .spicy *[set/search/bearer]*`;

    if (text.startsWith('set')) {
        let id = text.slice(4);
        if (!id) throw `*Contoh:* .spicy xxx-xxxxxx-xxxx\n\nCharacter ID bisa dicari dengan perintah .spicy search namaCharacter`;
        await spicyAI.setUser(m.sender, id);

        let char = await spicyAI.infoChar(id);
        m.reply(`[ ✓ ] Berhasil Mengganti Character Menjadi *${char.name}*`);
    } else if (text.startsWith('bearer')) {
        if (!spicyAI.load) {
            await spicyAI.loadData();
        }

        if (!isOwner) throw `Hanya Owner yang bisa mengganti bearer token`;
        if (!text.slice(7)) throw `*Contoh:* .spicy bearer xxx-xxxxxx-xxxx`;

        spicyAI.bearer = text.slice(7);
        await spicyAI.saveData();
        m.reply("[ ✓ ] Berhasil Mengganti Token");
    } else if (text.startsWith('search')) {
        let name = text.slice(7);
        if (!name) throw `*Contoh:* .spicy search namaCharacter`;
        let res = await spicyAI.searchCharacters(name);
        if (!res) throw `Character ${name} Tidak Ditemukan`;

        let result = res.results[0].hits
        let caption = '*✧ RESULT SPICY AI ✧*\n\n';

        for (let i = 0; i < result.length; i++) {
            if (i >= 10) break;
            let doc = result[i].document
            caption += `*• ${doc.name}*\n`;
            caption += `> ${doc.title}\n`;
            caption += `> NSFW : ${doc.is_nsfw}\n`;
            caption += `> ID : ${doc.character_id}\n\n`;
            caption += `──────────────────\n\n`;
        }
        
        m.reply(caption);
    }
};

handler.before = async (m, { conn }) => {
    if (m.isBaileys && m.fromMe) return;
    if (!m.text) return;
    if (m.sender === 'status@broadcast') return;
    if (m.isGroup) return;
    let chatbot = global.db.data.users[m.sender].chatbot;
    if (!chatbot || chatbot !== 'spicyai') return;

    if (
        m.text.startsWith(".") ||
        m.text.startsWith("#") ||
        m.text.startsWith("!") ||
        m.text.startsWith("/") ||
        m.text.startsWith("\\/")
    ) return;

    if (m.message.reactionMessage) return

    try {
        await conn.sendMessage(m.chat, { react: { text: `⏱️`, key: m.key }});

        const type = m.text === "--auto" ? 'autopilot' : m.text === "--continue" ? 'continue_chat' : 'message';
        let res = await spicyAI.ask(m.sender, null, m.text, type);
        let caption;
        if (m.text === '--auto') {
            caption = `*[ YOU ]*\n${res.content}\n\n*[ ${res.ai.name} ]*\n${res.response.message.content}`;
        } else {
            caption = res.response.message.content;
        }

        await conn.sendMessage(m.chat, { react: { text: `✅`, key: m.key }});

        conn.sendMessage(m.chat, {
            text: caption,
            contextInfo: {
                externalAdReply: {
                    title: res.ai.name,
                    body: 'AI Chatbot',
                    thumbnailUrl: res.ai.avatar_url,
                    sourceUrl: `https://spicychat.ai/`,
                    mediaType: 1,
                    renderLargerThumbnail: false
                }
            }
        });
    } catch (error) {
        console.log(error);
        m.reply("Maaf, terjadi kesalahan saat memproses permintaan Anda.");
    }
};

handler.command = ['spicy'];
handler.tags = ["ai"];
handler.help = ['spicy set <charID>', 'spicy bearer <token>'];

export default handler;
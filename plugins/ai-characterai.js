import CharacterAI from "../lib/characterAI.js";
import axios from "axios";
import * as cheerio from 'cheerio';

const characterAI = new CharacterAI('./database/characterAI.json');

const handler = async (m, { conn, text, command, isOwner }) => {
    if (!text) throw `*Contoh:* .cai *[set/search/token]*`;

    if (text.startsWith('set')) {
        let id = text.slice(4);
        if (!id) throw `*Contoh:* .cai xxx-xxxxxx-xxxx\n\nCharacter ID bisa dicari dengan perintah .cai search namaCharacter`;
        await characterAI.setUser(m.sender, id);

        m.reply(`[ ✓ ] Berhasil Mengganti Character ID`);
    } else if (text.startsWith('token')) {
        if (!characterAI.initate) {
            await characterAI.loadData();
        }

        if (!isOwner) throw `Hanya Owner yang bisa mengganti token`;
        if (!text.slice(7)) throw `*Contoh:* .cai token xxx-xxxxxx-xxxx`;

        characterAI.user_id = null;
        characterAI.userData = {};
        characterAI.token = text.slice(6);
        await characterAI.saveData();
        m.reply("[ ✓ ] Berhasil Mengganti Token");
    } else if (text.startsWith('search')) {
        let name = text.slice(7);
        if (!name) throw `*Contoh:* .cai search namaCharacter`;

        await conn.sendMessage(m.chat, { react: { text: `⏱️`, key: m.key }});

        const result = await searchCharacter(name);

        let caption = '*✧ RESULT CHARACTER AI ✧*\n\n'

        let num = 0
        caption += result.map((i) => {
            num += 1
            return `*_[ ${i.participant__name} ]_*\n` +
                `*_Title_* :\n> ${i.title}\n` +
                `*_Score_* :\n> ${i.score}\n` +
                `*_CharID_* :\n> ${i.external_id}\n\n`
        }).join('')

        await conn.sendMessage(m.chat, { react: { text: `✅`, key: m.key }});

        conn.sendMessage(m.chat, {
            text: caption,
            contextInfo: {
                externalAdReply: {
                    title: `Karater ${text}`,
                    body: 'Character AI',
                    thumbnailUrl: 'https://characterai.io/i/400/static/avatars/' + result[0].avatar_file_name,
                    sourceUrl: 'https://character.ai',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        });
    }
};

handler.before = async (m, { conn }) => {
    if (m.isBaileys && m.fromMe) return;
    if (!m.text) return;
    if (m.isGroup) return;
    if (m.sender === 'status@broadcast') return;
    let chatbot = global.db.data.users[m.sender].chatbot;
    if (!chatbot || chatbot !== 'cai') return;

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

        const newChat = m.text === '--newchat'
        if (newChat) m.text = 'hello'

        const username = m.pushName || 'ShiroNexo'
        const { response, ai } = await characterAI.ask(username, m.sender, null, m.text, newChat);
        
        await conn.sendMessage(m.chat, { react: { text: `✅`, key: m.key }});

        conn.sendMessage(m.chat, {
            text: response,
            contextInfo: {
                externalAdReply: {
                    title: ai.name,
                    body: 'character AI',
                    thumbnailUrl: ai.avatar_url,
                    sourceUrl: "https://character.ai",
                    mediaType: 1,
                    renderLargerThumbnail: false
                }
            }
        })
    } catch (error) {
        console.log(error);
        m.reply("Maaf, terjadi kesalahan saat memproses permintaan Anda.");
    }
};

handler.help = ['cai set <charID>', 'cai bearer <token>']
handler.command = ['cai']
handler.tags = ['ai'];
handler.limit = true;

export default handler;


async function searchCharacter(query) {
    const url = `https://character.ai/search?q=${encodeURIComponent(query)}`;
    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        const scriptTag = $('#__NEXT_DATA__');
        if (scriptTag.length === 0) {
            throw new Error('Script tag with id "__NEXT_DATA__" not found.');
        }

        const jsonData = JSON.parse(scriptTag.html())

        let result = jsonData.props.pageProps.prefetchedSearchResults.slice(0, 20);
        return result
    } catch (error) {
        console.error('Error fetching or parsing data:', error);
        throw error;
    }
}
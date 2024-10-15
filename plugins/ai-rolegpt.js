import RoleGPT from '../lib/rolegpt.js';
import axios from 'axios'
import FormData from 'form-data'

const rolegpt = new RoleGPT('./database/rolegpt.json');

let handler = async (m, { conn, text, isOwner }) => {
    if (!text) throw `*Contoh:* .rolegpt *[set/character/newchar/key]*`;
    if (!rolegpt.initate) {
        await rolegpt.loadData();
    }

    if (text.startsWith('set')) {
        let character = text.slice(4);
        if (!character) throw `*Contoh:* .rolegpt set default\n\nCharacter bisa dicari dengan perintah .rolegpt character`;
        if (!rolegpt.characters[character]) throw `Character ${character} Tidak Ditemukan`;

        await rolegpt.setUser(m.sender, character);

        m.reply(`[ ✓ ] Berhasil Mengganti Character ID`);
    } else if (text.startsWith('character')) {
        let caption = '*✧ LIST CHARACTER ✧*\n\n'

        let char = Object.keys(rolegpt.characters)

        if (!char.length) throw `Tidak Ada Character yang ditambahkan`;

        for (let i = 0; i < char.length; i++) {
            caption += `*• ${char[i]}*\n`
        }

        m.reply(caption);
    } else if (text.startsWith('newchar')) {
        if (!isOwner) throw `Hanya Owner yang bisa menambahkan character`;

        const data = text.slice(8);
        let [character, description] = data.split('|');
        if (!character) throw `*Contoh:* .rolegpt newchar default\n\nCharacter ID bisa dicari dengan perintah .rolegpt character`;

        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || ''
        let imageUrl = null

        if (/image\/(jpe?g|png)/.test(mime)) {
            let media = await q.download()
            let formData = new FormData()
            formData.append('file', media, {
                filename: 'image.png',  // You can dynamically extract file extension here if needed
                contentType: mime
            })

            // Make a POST request to Widipe API
            let widipeResponse = await axios.post('https://widipe.com/api/upload.php', formData, {
                headers: {
                    ...formData.getHeaders()  // Include the necessary headers from FormData
                }
            })

            // Extract the result from Widipe API
            imageUrl = widipeResponse.data.result.url
        }

        character = character.trim().replace(/\s+/g, '_')

        let result = await rolegpt.newCharacter(character, description, imageUrl);
        if (!result) throw `Character *${character}* Gagal dibuat`;

        m.reply(`[ ✓ ] Berhasil Menambahkan Character *${character}*`);
    } else if (text.startsWith('delchar')) {
        if (!isOwner) throw `Hanya Owner yang bisa menghapus character`;

        let character = text.slice(8);
        if (!character) throw `*Contoh:* .rolegpt delchar default\n\nCharacter ID bisa dicari dengan perintah .rolegpt character`;
        if (!rolegpt.characters[character]) throw `Character *${character}* Tidak Ditemukan`;

        delete rolegpt.characters[character];
        await rolegpt.saveData();
        m.reply(`[ ✓ ] Berhasil Menghapus Character *${character}*`);
    } else if (text.startsWith('key ')) {
        if (!isOwner) throw `Hanya Owner yang bisa mengganti apiKey`;
        if (!text.slice(4)) throw `*Contoh:* .rolegpt key xxx-xxxxxx-xxxx`;

        rolegpt.apiKey = text.slice(4);
        await rolegpt.saveData();
        m.reply("[ ✓ ] Berhasil Mengganti Token");
    }
};

handler.before = async (m, { conn }) => {
    if (m.isBaileys && m.fromMe) return;
    if (m.sender === 'status@broadcast') return;
    if (m.isGroup) return;
    if (!m.text) return;
    let chatbot = global.db.data.users[m.sender].chatbot;
    if (chatbot && chatbot !== 'rolegpt') return;

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

        const { response, ai } = await rolegpt.ask(m.sender, null, m.text);
        
        await conn.sendMessage(m.chat, { react: { text: `✅`, key: m.key }});

        if (!ai) return m.reply(response)

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

handler.command = ['rolegpt'];
handler.tags = ["ai"];
handler.help = ['rolegpt set <char Name>', 'rolegpt newchar <char name>|<char description>'];

export default handler;
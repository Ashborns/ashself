import SpicyAI from "../lib/spicyAI.js";
const {
    getDevice,
    proto,
    generateWAMessageFromContent
} = (await import('@adiwajshing/baileys')).default

const spicyAI = new SpicyAI('./database/spicyAI.json');

let handler = async (m, { conn, text, command, isOwner }) => {
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

        let device = getDevice(m.key.id);

        if (device === "android") {
            const carouselMessage = generateWAMessageFromContent(m.chat, {
                'viewOnceMessage': {
                    'message': {
                        'messageContextInfo': {
                            'deviceListMetadata': {},
                            'deviceListMetadataVersion': 2
                        },
                        'interactiveMessage': proto.Message.InteractiveMessage.fromObject({
                            'body': proto.Message.InteractiveMessage.Body.create({
                                'text': `Pilih Karakter Dari List Dibawah Ini!`
                            }),
                            'footer': proto.Message.InteractiveMessage.Footer.create({
                                'text': '@SpicyAI'
                            }),
                            'header': proto.Message.InteractiveMessage.Header.create({
                                'hasMediaAttachment': false
                            }),
                            'nativeFlowMessage': proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                                buttons: [{
                                    name: 'single_select',
                                    buttonParamsJson: JSON.stringify({
                                        title: 'Character List',
                                        sections: [{
                                            title: name,
                                            rows: result.map((i) => {
                                                let doc = i.document;
                                                return {
                                                    title: `${doc.name} (NSFW: ${doc.is_nsfw ? 'Yes' : 'No'})`, // Menambahkan informasi NSFW di title
                                                    description: doc.title, // Menggunakan judul karakter saja di deskripsi
                                                    id: `.${command} set ${doc.character_id}` // Menggunakan character_id yang benar
                                                };
                                            })


                                        }]
                                    })
                                }]
                            })
                        })
                    }
                }
            }, {});

            await conn.sendMessage(m.chat, { react: { text: `✅`, key: m.key } });

            await conn.relayMessage(m.chat, carouselMessage.message, {
                'messageId': carouselMessage.key.id
            })
            return
        }


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
        await conn.sendMessage(m.chat, { react: { text: `⏱️`, key: m.key } });

        const type = m.text === "--auto" ? 'autopilot' : m.text === "--continue" ? 'continue_chat' : 'message';
        let res = await spicyAI.ask(m.sender, null, m.text, type);
        let caption;
        if (m.text === '--auto') {
            caption = `*[ YOU ]*\n${res.content}\n\n*[ ${res.ai.name} ]*\n${res.response.message.content}`;
        } else {
            caption = res.response.message.content;
        }

        await conn.sendMessage(m.chat, { react: { text: `✅`, key: m.key } });

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
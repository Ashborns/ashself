import { Morphic } from "../lib/morphic.js";
import fs from "fs";

const morphic = new Morphic();
const dataPath = './database/morphic.json';
let morphData = null;
let isLogin = false

const handler = async (m, { conn, text, command, isOwner }) => {
    m.reply('Beberapa perintah Morphic AI\n\n> --system <query>\nDapat digunakan untuk mengganti system prompt\n\n> --web <query>\nDapat digunakan untuk mencari hasil web\n\n> --image <query>\nDapat digunakan untuk mencari gambar\n\n> --query <query>\nDapat digunakan untuk mencari query\n\n> --reset\nMengembalikan system prompt default dan mereset history');
};

handler.before = async (m, { conn, isOwner }) => {
    let text = m.text
    if (m.isBaileys && m.fromMe) return;
    if (m.sender === 'status@broadcast') return;
    if (m.isGroup) return;
    if (!m.text) return;
    let chatbot = global.db.data.users[m.sender].chatbot;
    if (!chatbot || chatbot !== 'morph') return;

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

        if (!morphData) {
            try {
                morphData = JSON.parse(fs.readFileSync(dataPath));
            } catch (error) {
                morphData = {};
            }
        }

        morphData[m.sender] = morphData[m.sender] ? morphData[m.sender] : { mess: null, system: null }
        let morpMess = morphData[m.sender].mess
        let sysPrompt = morphData[m.sender].system

        if (morphic.account.email && morphic.account.pass && !isLogin) {
            let login = await morphic.login(morphic.account.email, morphic.account.pass)
            if (login.success) {
                console.log('Berhasil Login Akun Morphic')
                isLogin = true
            }
        }

        let system = 'Anda adalah AI Asisstant bernama Ash. Anda lebih suka berbicara bahasa Indonesia. Kepribadian Anda: Menyenangkan, suka bercanda, santai tetapi serius ketika menjawab pertanyaan. Kamu membantu orang lain dengan pertanyaan yang mereka ajukan.'

        if (text.startsWith('--system')) {
            sysPrompt = text.slice(9) || system
            text = 'haloo'
            morpMess = null
        } else if (text.startsWith('--reset')) {
            delete morphData[m.sender]
            fs.writeFileSync(dataPath, JSON.stringify(morphData, null, 4))
            return m.reply('berhasil menghapus history')
        }

        system = sysPrompt || system

        let message;
        
        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || ''
        if (/image\/(jpe?g|png)/.test(mime)) {
            let img = await q.download()
            let imgName = `./tmp/${new Date * 1}.png`
            fs.writeFileSync(imgName, img)

            message = morpMess?.messages ?
                await await morphic.addInput({
                    prompt: text || "Describe this image!",
                    files: [imgName]
                }, morpMess) :
                await morphic.addInput({
                    prompt: text || "Describe this image!",
                    files: [imgName]
                }, await morphic.chat(system).then(v => v.chat))
        } else {
            message = morpMess?.messages ?
                await await morphic.addInput(text, morpMess) :
                await morphic.addInput(text, await morphic.chat(system).then(v => v.chat))
        }
        
        let data = await morphic.chat(message);

        let image = 'https://s6.imgcdn.dev/qkdph.jpg'
        let isLarge = false
        let mess;
        if (text.startsWith('--web')) {
            text = text.slice(6)
            mess = data.search
                .map(
                    (v, i) =>
                        `${i + 1}. Title : ${v.title}\nUrl : ${v.url}\nContent : ${v.content}`
                )
                .join("\n\n")
        } else if (text.startsWith('--image')) {
            isLarge = true
            text = text.slice(8)
            image = data.images[0].url
            mess = data.images
                .map(
                    (v, i) => `${i + 1}. Url : ${v.url}\nDescription : ${v.description}`
                )
                .join("\n\n")
        } else if (text.startsWith('--query')) {
            text = text.slice(8)
            mess = data.query.map((v, i) => `${i + 1}. ${v}`).join("\n\n")
        } else {
            mess = data.answer
        }

        morphData[m.sender] = {
            mess: data.chat,
            system
        }

        fs.writeFileSync(dataPath, JSON.stringify(morphData, null, 4));
        
        await conn.sendMessage(m.chat, { react: { text: `✅`, key: m.key }});

        conn.sendMessage(m.chat, {
            text: mess.replace(/\\n/g, '\n'),
            contextInfo: {
                externalAdReply: {
                    title: 'Ashboo',
                    body: 'Morphic AI',
                    thumbnailUrl: image,
                    sourceUrl: "https://www.morphic.sh/",
                    mediaType: 1,
                    renderLargerThumbnail: isLarge ? true : false
                }
            }
        })
    } catch (error) {
        console.log(error);
        m.reply("Maaf, terjadi kesalahan saat memproses permintaan Anda.");
    }
};

handler.help = ['morph']
handler.command = ['morph']
handler.tags = ['ai'];
handler.limit = true;

export default handler;
/*
wa.me/6282285357346
github: https://github.com/sadxzyq
Instagram: https://instagram.com/tulisan.ku.id
ini wm gw cok jan di hapus
*/

import axios from "axios";

/**
Anti NSFW by Tio
**/

export async function before(m, {
    conn
}) {
    let chat = global.db.data.chats[m.chat]
    let user = global.db.data.users[m.sender]
    if (m.isBaileys && m.fromMe ) return true;
    if (!m.isGroup) return false
    if (!chat.antiNsfw) return false

    const {
        mtype,
        text,
        sender
    } = m
    let hapus = m.key.participant
    let bang = m.key.id

    if (mtype === 'imageMessage' || mtype === 'stickerMessage') {
        //code
        const media = await m.download()

        const { R18, message } = await checkRating(media)
        if (R18) {
            return conn.sendMessage(m.chat, {
                text: message,
            }, {
                quoted: m,
                mentions: m.sender
            }).then(_ => {
                conn.sendMessage(m.chat, {
                    delete: {
                        remoteJid: m.chat,
                        fromMe: m.fromMe, // Menghapus pesan sesuai pengirim (bot atau pengguna lain)
                        id: bang,
                        participant: hapus
                    }
                })
            })
        } else {
            console.log('media aman')
        }
    }
}

async function checkRating(buffer) {
    const base64Image = `data:image/jpeg;base64,${Buffer.from(buffer, "binary").toString("base64")}`;

    // Send image data to the server using POST request
    let { data } = await axios.post(
        "http://47.236.168.119:80/predict",
        {
            image: base64Image
        },
        {
            headers: {
                "Content-Type": "application/json" // Set content type as octet-stream
            }
        }
    );

    const classesToCheck = ['Hentai', 'Porn', 'Sexy'];

    // Ambang batas probabilitas
    const threshold = 0.5;

    console.log(data)

    let is18 = false
    let predic;

    // Periksa setiap prediksi untuk kelas-kelas yang ingin diperiksa
    for (const prediction of data.result) {
        if (classesToCheck.includes(prediction.className) && prediction.probability > threshold) {
            is18 = true;
            predic = { name: prediction.className, probability: prediction.probability }
            break
        }
    }

    if (is18) {
        return { R18: true, message: `☛ Detected ${predic.name} Image with probability greater than ${(predic.probability * 100).toFixed(2)}%`, output: buffer };
    } else {
        return { R18: false, message: 'No image detected with probability greater than 50%', output: buffer };
    }
}
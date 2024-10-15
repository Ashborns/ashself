import fetch from 'node-fetch';
import FormData from 'form-data';
import { removeBackgroundFromImageUrl } from 'remove.bg';

const uploadImage = async (image) => {
    const form = new FormData();
    form.append('file', image, 'image.jpg');

    const response = await fetch('https://widipe.com/api/upload.php', {
        method: 'POST',
        body: form,
    });

    const result = await response.json();

    if (!result.status) throw 'Gagal mengunggah gambar!';
    return result.result.url;
};

let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || '';
        if (!mime) throw 'Fotonya Mana?';
        if (!/image\/(jpe?g|png)/.test(mime)) throw `Tipe ${mime} tidak didukung!`;

        m.reply('⏳ Sedang diproses... Mohon tunggu.');

        let img = await q.download();
        let url = await uploadImage(img);

        let out = await nobg(url);
        await conn.sendFile(m.chat, out, 'out.png', '*DONE (≧ω≦)ゞ*', m);
    } catch (e) {
        console.error(e);
        m.reply('Terjadi kesalahan saat memproses gambar!');
    }
};

handler.help = ['removebg'];
handler.tags = ['tools', 'premium'];
handler.command = /^(removebg|nobg)$/i;
handler.premium = false;

export default handler;

async function nobg(url) {
    try {
        const result = await removeBackgroundFromImageUrl({
            url,
            apiKey: apikey.getRandom(),
            size: 'regular',
            type: 'auto',
        });
        return Buffer.from(result.base64img, 'base64');
    } catch (e) {
        console.error(e);
        throw 'Gagal menghapus latar belakang!';
    }
}

const apikey = [
    't4DJWibUPdxTbCiZs6wXUTMB',
    'Divb33Vh3YANNFJMPkv4QJs3',
    '61N7EMLJURGuTdYpavHwkWTC'
];

apikey.getRandom = () => apikey[Math.floor(Math.random() * apikey.length)];
/* JANGAN HAPUS INI 
SCRIPT BY © VYNAA VALERIE 
•• recode kasih credits 
•• contacts: (6282389924037)
•• instagram: @vynaa_valerie 
•• (github.com/VynaaValerie) 
*/
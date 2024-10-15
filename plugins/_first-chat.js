/* JANGAN HAPUS INI 
SCRIPT BY © VYNAA VALERIE 
•• recode kasih credits 
•• contacts: (6282389924037)
•• instagram: @vynaa_valerie 
•• (github.com/VynaaValerie) 
*/
import moment from 'moment-timezone';

export async function before(m) {
    if (m.chat.endsWith('broadcast') || m.fromMe || m.isGroup) return;

    const user = global.db.data.users[m.sender];
    const currentTime = new Date();
    const time = moment.tz(currentTime, 'Asia/Jakarta').format('HH');

    let res = "Selamat dinihari 🌆";
    if (time >= 4 && time < 10) {
        res = "Selamat pagi 🌄";
    } else if (time >= 10 && time < 15) {
        res = "Selamat siang ☀️";
    } else if (time >= 15 && time < 18) {
        res = "Selamat sore 🌇";
    } else if (time >= 18) {
        res = "Selamat malam 🌙";
    }

    let txt = `👋 Hai, ${res}

${user.banned ? '📮Maaf, kamu dibanned & Tidak bisa menggunakan bot ini lagi' : `💬 Ada yg bisa Ash AI bantu?\nSilahkan ketik *.menu* untuk melihat daftar menu pada bot, ketik *.help* untuk info bot ketik *.rules* untuk melihat peraturan pengguna bot`}`.trim();

    // Periksa apakah sudah melewati waktu minimum sejak pesan terakhir dikirim
    if (currentTime - user.lastSentTime < 21600000) return;

    await this.reply(m.chat, txt, null, {
        contextInfo: {
            externalAdReply: {
                showAdAttribution: true,
                title: wm,
                thumbnailUrl: 'https://widipe.com/file/e1uXxyGHcpnW.png',
                sourceUrl: 'https://github.com/VynaaValerie',
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    });

    // Update waktu terakhir pesan dikirim
    user.lastSentTime = currentTime;
}
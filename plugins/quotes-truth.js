import { truth } from '@bochilteam/scraper';

let handler = async (m, { conn, usedPrefix }) => {
    let text = `${await truth()}`;
    conn.sendMessage(m.chat, {
        text: text,
        contextInfo: {
            externalAdReply: {
                title: `Truth or Dare`,
                thumbnailUrl: 'https://telegra.ph/file/7caa2b8da56c89f486c95.jpg',
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    });
}

handler.help = ['truth', 'tod'];
handler.tags = ['quotes', 'fun'];
handler.command = /^(truth|tod)$/i;

export default handler;
/*
SCRIPT BY © VYNAA VALERIE 
•• recode kasih credits 
•• contacts: (t.me/VLShop2)
•• instagram: @vynaa_valerie 
•• (github.com/VynaaValerie) 
*/
/* JANGAN HAPUS INI 
SCRIPT BY © VYNAA VALERIE 
•• recode kasih credits 
•• contacts: (6282389924037)
•• instagram: @vynaa_valerie 
•• (github.com/VynaaValerie) 
*/

import fetch from "node-fetch";

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return conn.reply(m.chat, `• *Example :* ${usedPrefix + command} avatar`, m);
  conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } });

  try {
    const response = await fetch(`https://widipe.com/filmapiksearch?query=${encodeURIComponent(text)}`);
    const res = await response.json();

    let resultText = '';
    if (res.result && res.result.data.length) {
      res.result.data.forEach((result) => {
        const { title, rating, url, thumbnail } = result;
        resultText += `• Title: *${title}*\n• Rating: *${rating}*\n• Link: *${url}*\n\n`;
      });

      conn.sendMessage(m.chat, {
        text: resultText,
        contextInfo: {
          externalAdReply: {
            title: 'Film Search - VynaaAI',
            thumbnailUrl: res.result.data[0].thumbnail, // Update thumbnail URL
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      });
    } else {
      conn.reply(m.chat, "No data found.", m);
    }
  } catch (error) {
    console.error(error);
    conn.reply(m.chat, "An error occurred while fetching the data.", m);
  }
};

handler.help = ['film'].map(v => v + ' *<text>*');
handler.tags = ['internet'];

handler.command = /^film|filem|apik$/i;
handler.premium = false;

export default handler;
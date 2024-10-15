import fetch from "node-fetch";
import fs from "fs";
import { pickRandom } from "../lib/other-function.js";

let handler = async (m, { conn, usedPrefix, text, args, command }) => {
  let nomorown = '62895328108012'; 
  let aa = pickRandom(global.elainajpg); 
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
  let ephemeral = 3600000;

  let vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:Ashbornaru\nTEL;type=CELL;waid=${nomorown}:${nomorown}\nEND:VCARD`;

  await conn.sendMessage(m.chat, {
    contacts: {
      displayName: 'Ashbornaru',
      contacts: [{ vcard }]
    }
  }, {
    quoted: m,
    ephemeralExpiration: ephemeral,
    contextInfo: { 
      externalAdReply: {  
        title: 'Contact Owner', 
        body: wm, 
        sourceUrl: link.web,
        thumbnail: global.vynaajpg,
        mediaType: 1,
        showAdAttribution: true, 
        renderLargerThumbnail: true 
      },
      mentionedJid: [nomorown]
    }
  });
};

handler.help = ['owner'];
handler.tags = ['misc'];
handler.command = /^(dev|owner|creator)$/i;

export default handler;
/* JANGAN HAPUS INI 
SCRIPT BY © VYNAA VALERIE 
•• recode kasih credits 
•• contacts: (6282389924037)
•• instagram: @vynaa_valerie 
•• (github.com/VynaaValerie) 
*/
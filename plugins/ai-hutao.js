import fetch from 'node-fetch';
import axios from 'axios';

let previousMessages = [];

const handler = async (m, { text, conn, usedPrefix, command }) => {
  if (!text) return conn.reply(m.chat, `• *Contoh :* .hutao haii`, m);
  
  let name = conn.getName(m.sender);
  await conn.sendMessage(m.chat, { react: { text: `⏱️`, key: m.key }});
  if (text.includes('group') && text.includes('tutup')) {
    await conn.groupSettingUpdate(m.chat, 'announcement');
    conn.reply(`Oke, grup telah ditutup. Mimpi Indah ya~ 😉`);
  } else if (text.includes('group') && text.includes('buka')) {
    await conn.groupSettingUpdate(m.chat, 'not_announcement');
    conn.reply(`Oke, grup telah dibuka! 😉`);
  }
  
  let prompt = `Mulai sekarang nama kamu adalah Hutao, kamu mempunyai sifat yang ramah, lucu, dan suka membantu orang lain, kamu selalu menjawab semua pertanyaan yang di berikan menggunakan bahasa indonesia dan selalu menggunakan kata panggilan aku dan kamu!, kamu adalah ai buatan dari Hyuu yang di buat hanya untuk menjawab semua pertanyaan dengan ramah, dan lawan bicaramu sekarang adalah ${name}, dan kamu merespon pertanyaan di awali dengan kata sapaan sepeti halo di tambahkan dengan ${name}. dan ingat jangan bicara menggunakan kata formal anggap ${name} adalah teman mu.`;
  
  let cai = await fetch(`https://itzpire.site/ai/gpt-logic?q=${text}&logic=${prompt}&realtime=true`);
  let emu = await cai.json();
  await conn.sendMessage(m.chat, { react: { text: `✅`, key: m.key }});
  
  let hasil = `*〤 H U T A O*\n\n${emu.data.response}`;
  let img = 'https://telegra.ph/file/94c0158d3369d09c15adf.jpg';
  await conn.sendFile(m.chat, img, '', hasil, m);
  
  previousMessages = prompt;
};

handler.help = ['hutao *{text}*'];
handler.command = /^hutao$/i;
handler.tags = ['ai'];
handler.premium = false;

export default handler;
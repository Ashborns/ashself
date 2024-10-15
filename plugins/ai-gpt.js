import { openai } from 'betabotz-tools'

let handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) return conn.reply(m.chat, '• *Example :* .ai hello', m)
  let kemii = await conn.reply(m.chat, '```Sedang mencari jawaban...🔍```', m)
  let hasil = await openai(text)
  await conn.sendMessage(m.chat, { text: `${hasil.result}`.trim(), edit: kemii })
}
handler.command = ["gpt","ai"];
handler.help = ['gpt *<text>*']
handler.tags = ['tools','ai']
handler.register = false
handler.limit = true

export default handler;
/*
SCRIPT BY © VYNAA VALERIE 
•• recode kasih credits 
•• contacts: (t.me/VLShop2)
•• instagram: @vynaa_valerie 
•• (github.com/VynaaValerie) 
*/

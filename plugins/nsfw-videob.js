let handler = async (m, { conn, usedPrefix, command }) => {
  if (!db.data.chats[m.chat].nsfw && m.isGroup) return m.reply(global.nsfw);
    
    let user = global.db.data.users[m.sender].age;
    if (user < 17) m.reply('❎ Kamu belum cukup umur! Silakan kembali ketika kamu berusia di atas 18 tahun');
let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
let name = conn.getName(who)
  conn.sendFile(m.chat, pickRandom(vbokep), null, `Nih *${name}* Video bokepnya..`, m)
}
handler.help = ['vidiobokep']
handler.tags = ['nsfw']
handler.command = /^(vbokep|vidiobokep)$/i

handler.premium = true
handler.nsfw = true
handler.limit = false

handler.fail = null
handler.register = true

export default handler

function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())]
}

const vbokep = [

"https://telegra.ph/file/f9f3d01fead02386e5331.mp4",
"https://telegra.ph/file/d1d7b11f5ab57b3e57d01.mp4",
"https://telegra.ph/file/11e0d15aac245accb6217.mp4",
"https://telegra.ph/file/dadd5f030d75ff9e787c8.mp4",
"https://telegra.ph/file/d18b06f324412d2cdb270.mp4",
"https://telegra.ph/file/7d3a354b69fe2e1c60d34.mp4",
"https://telegra.ph/file/1ae88269d50a627761072.mp4",
]
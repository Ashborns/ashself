let handler = async (m, { conn, command, usedPrefix, text }) => {
  let fail = `Format salah, contoh: ${usedPrefix + command} Arietube|1. Masak`
  
  global.db.data.users[m.sender].catatan = global.db.data.users[m.sender].catatan || []
  let catatan = global.db.data.users[m.sender].catatan
  let split = text.split('|')
  let title = split[0]
  let isi = split[1]

  if (catatan.some(note => note.title === title)) {
    return m.reply('Judul tidak tersedia!\n\nAlasan: Sudah digunakan')
  }

  if (!title || !isi) return m.reply(fail)

  let cttn = {
    'title': title,
    'isi': isi
  }

  global.db.data.users[m.sender].catatan.push(cttn)
  
  await conn.sendMessage(m.chat, {
    text: `Catatan berhasil dibuat!\nUntuk melihat catatan, ketik: ${usedPrefix}lihatcatatan`,
    mentions: conn.parseMention(text)
  }, { quoted: m })
}

handler.help = ['buatcatatan <title|isi>']
handler.tags = ['menuprem', 'database']
handler.command = /^buatcatatan$/i

export default handler

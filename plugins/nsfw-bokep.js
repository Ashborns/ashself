import axios from 'axios'

let handler = async (m, { conn }) => {
  if (!db.data.chats[m.chat].nsfw && m.isGroup) return m.reply(global.nsfw);
    
    let user = global.db.data.users[m.sender].age;
    if (user < 17) m.reply('❎ Kamu belum cukup umur! Silakan kembali ketika kamu berusia di atas 18 tahun');
  const api = `https://api.zahwazein.xyz/randomasupan/discord18?apikey=${global.zen}`
  try {
    conn.sendMessage(m.chat, {
		react: {
			text: '♻️',
			key: m.key,
		}
	})
    const res = await axios.get(api)
    const result = res.data.result
    conn.sendFile(m.chat, result, 'asupan.mp4', '*Here ur porn.*', m)
  } catch (e) {
    console.log(e)
    conn.reply(m.chat, 'An error occurred while processing your request.', m)
  }
}

handler.help = ['bokeplagi']
handler.tags = ['nsfw']
handler.register = true
handler.premium = true
handler.limit = true
handler.nsfw = true

handler.command = /^(bokeplagi)$/i

export default handler
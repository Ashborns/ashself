const handler = async (m, { conn, command }) => {
  if (!db.data.chats[m.chat].nsfw && m.isGroup) return m.reply(global.nsfw);

  let userAge = global.db.data.users[m.sender].age;
  if (userAge < 17) return m.reply('❎ Kamu belum cukup umur! Silakan kembali ketika kamu berusia di atas 18 tahun');

  // Daftar kata yang tersedia
  const validKeywords = ['lesbian', 'cosplay', 'pussy', 'ass', 'boobs'];

  // Ambil argumen kedua setelah ".fgmod", misalnya "lesbi"
  let keyword = m.text.split(' ')[1];

  // Jika tidak ada argumen, tampilkan daftar pilihan yang tersedia
  if (!keyword) {
    return m.reply(`❎ Silakan pilih salah satu opsi berikut dan gunakan:\n\n${validKeywords.map(k => `• ${k}`).join('\n')}\n\nContoh penggunaan:\n.fgmod ass\n.fgmod cosplay`);
  }

  // Jika keyword tidak valid, kirim pesan error
  if (!validKeywords.includes(keyword)) {
    return m.reply(`❎ Keyword tidak valid! Pilih salah satu dari: ${validKeywords.join(', ')}`);
  }

  // Reaksi saat loading (misalnya: jam)
  await conn.sendMessage(m.chat, {
    react: {
      text: '⏳', // Emoji untuk loading
      key: m.key,
    }
  });

  // Proses pengiriman file
  try {
    await conn.sendFile(m.chat, `https://api.fgmods.xyz/api/nsfw/${keyword}?apikey=vMCg3caA`, `${keyword}.jpg`, `Ini kak ${keyword}`, m);

    // Reaksi saat eksekusi selesai (misalnya: centang)
    await conn.sendMessage(m.chat, {
      react: {
        text: '✅', // Emoji untuk sukses
        key: m.key,
      }
    });
  } catch (error) {
    // Reaksi saat terjadi error (misalnya: tanda silang)
    await conn.sendMessage(m.chat, {
      react: {
        text: '❌', // Emoji untuk error
        key: m.key,
      }
    });
    return m.reply('❎ Terjadi kesalahan saat mengambil data.');
  }
};

handler.help = ['fgmod'];
handler.tags = ['nsfw'];
handler.command = /^fgmod$/i;
handler.premium = true;
handler.register = true;
handler.nsfw = true;

export default handler;

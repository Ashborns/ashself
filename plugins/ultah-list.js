let handler = async (m, { conn, usedPrefix, text }) => {
  global.db.data.users[m.sender].ultah = global.db.data.users[m.sender].ultah || [];
  let i = 0;

  if (global.db.data.users[m.sender].ultah.length === 0)
    return m.reply("Kamu belum punya daftar ulang tahun!");

  let txt = "🎂 Daftar Ulang Tahun 🎂\n\n";

  for (let ct in global.db.data.users[m.sender].ultah) {
    i += 1;
    txt += `⌜${i}⌟ ${global.db.data.users[m.sender].ultah[ct].title}\n`;
  }

  if (text.length === 0) {
    return conn.reply(
      m.chat,
      `${txt}\nPenggunaan: ${usedPrefix}listultah 1\nHapus ultah: ${usedPrefix}hapusultah 1`
    );
  }

  let ultah = global.db.data.users[m.sender].ultah;
  let split = text.split("|");

  if (ultah.length === 0) return m.reply("Kamu belum memiliki daftar ultah!");
  let n = Number(split[0]) - 1;

  let isi =
    global.db.data.users[m.sender].ultah[n]?.isi || "🤔 Tidak ditemukan!";

  conn.reply(m.chat, `${isi}`, m, false, {
    contextInfo: {
      mentionedJid: conn.parseMention(text),
    },
  });
};

handler.help = ["listultah <title>"];
handler.tags = ["fun"];
handler.command = /^listultah$/i;

export default handler;

// SC BY © VYNAA CHAN
// RECODE WAJIB KASI CREDITS 
// WA: 6283896757978
// TOKO KEBUTUHAN BOT TERPERCAYA
// HANYA DI SINI
// https://linkbio.co/VLShop
// https://t.me/VynaaMD
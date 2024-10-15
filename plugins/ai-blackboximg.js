import { Blackbox } from "../lib/blackbox.js";
const blackbox = new Blackbox();

const handler = async (m, { command, usedPrefix, conn, args }) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || "";
  if (!mime) return m.reply("Tidak ada media yang ditemukan");
  
  const media = await q?.download();
  console.log("Media:", media); // Log media untuk pemeriksaan

  const input = args.length >= 1 ? args.slice(0).join(" ") : m.quoted?.text || m.quoted?.caption || m.quoted?.description || null;
  console.log("Input:", input); // Log input untuk pemeriksaan

  if (!input) return m.reply(`Masukkan teks atau reply pesan dengan teks yang ingin diolah.\nContoh penggunaan:\n*${usedPrefix}${command} Hai, apa kabar?*`);
  
  m.reply("Proses sedang berjalan...");
  try {
    const data = await blackbox.image(media, input);
    if (data) {
      m.reply(data);
    } else {
      m.reply("Tidak ada data yang dihasilkan.");
    }
  } catch (e) {
    console.error("Error:", e);
    m.reply("Terjadi kesalahan dalam memproses data.");
  }
};

handler.help = ["blackboximg"];
handler.tags = ["ai"];
handler.command = /^(blackboximg)$/i;

export default handler;

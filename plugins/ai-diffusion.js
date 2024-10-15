import fetch from "node-fetch";

const handler = async (m, {
  conn,
  usedPrefix,
  command,
  args
}) => {
  const text = args.length >= 1 ? args.slice(0).join(" ") : m.quoted && m.quoted?.text || m.quoted?.caption || m.quoted?.description || null;
  if (!text) return m.reply(`Masukkan teks atau reply pesan dengan teks yang ingin diolah.\nContoh penggunaan:\n*${usedPrefix}${command} highly detailed, intricate, 4k, 8k, sharp focus, detailed hair, detailed*`);
  
  // Kirim pesan menunggu
  const waitMsg = await conn.sendMessage(m.chat, { text: 'Proses sedang berlangsung...' }, { quoted: m });

  try {
    let res = await (await fetch(`https://api.neoxr.eu/api/waifudiff?q=${encodeURIComponent(text)}`)).json();
    await conn.sendMessage(m.chat, { 
      image: { url: res.data?.url }, 
      caption: `Prompt: ${res.data?.prompt}` 
    }, { quoted: m });
  } catch (e) {
    console.error(e);
    
    // Kirim pesan error
    await conn.sendMessage(m.chat, { text: 'Terjadi kesalahan. Silakan coba lagi nanti.' }, { quoted: m });
  }
};
handler.help = ["waifudiff"], handler.tags = ["ai"], handler.command = /^(waifudiff)$/i,
  handler.limit = !0;
export default handler;

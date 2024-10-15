import fetch from "node-fetch";

// Fungsi untuk mendapatkan jawaban dari API
async function TeachAnything(content) {
  try {
    const url = "https://www.teach-anything.com/api/generate";
    const headers = {
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36",
      Referer: "https://www.teach-anything.com/"
    };
    const body = JSON.stringify({ prompt: content });
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: body
    });
    const data = await response.text();
    return data;
  } catch (error) {
    console.error("Error:", error);
    return "Error occurred!";
  }
}

const handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args.length) {
    return conn.reply(m.chat, `Masukkan teks atau reply pesan dengan teks yang ingin diolah.\nContoh penggunaan:\n*${usedPrefix}${command} Jelaskan konsep AI*`, m);
  }

  // Kirim pesan "Processing..." dan simpan ID pesan
  const processingMessage = await conn.sendMessage(m.chat, { text: 'Sedang mencari jawaban...🔍' }, { quoted: m });

  try {
    const answer = await TeachAnything(args.join(" "));
    // Edit pesan "Processing..." dengan hasil dari API
    await conn.sendMessage(m.chat, { text: `${answer}`.trim() }, { quoted: m, edit: processingMessage.key.id });
  } catch (error) {
    console.error("Handler error:", error);
    // Jika terjadi error, edit pesan "Processing..." dengan pesan error
    await conn.sendMessage(m.chat, { text: 'Error occurred!' }, { quoted: m, edit: processingMessage.key.id });
  }
};

handler.help = ["teachanything"];
handler.tags = ["ai"];
handler.command = /^(teachanything)$/i;

export default handler;

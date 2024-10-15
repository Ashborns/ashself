import fetch from 'node-fetch';

// Fungsi untuk menghasilkan ID unik
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/*
   * Menggunakan Ambatron AI
   * Disarankan menggunakan https://lumin-ai.xyz
   * Contribution: Vynaa Valerie 
*/

function ambatronAi(content) {
  return new Promise(async (resolve, reject) => {
    const url = 'https://www.blackbox.ai/api/chat';

    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, Gecko) Chrome/128.0.0.0 Mobile Safari/537.36',
      'Referer': 'https://www.blackbox.ai/agent/ambatron'
    };

    const body = {
      messages: [
        {
          id: generateId(),
          content,
          role: "user"
        }
      ],
      id: generateId(),
      previewToken: null,
      userId: null,
      codeModelMode: true,
      agentMode: {
        mode: true,
        id: "ambatron",
        name: "Ambatron"
      },
      trendingAgentMode: {},
      isMicMode: false,
      maxTokens: 1024,
      isChromeExt: false,
      githubToken: null,
      clickedAnswer2: false,
      clickedAnswer3: false,
      clickedForceWebSearch: false,
      visitFromDelta: false,
      mobileClient: false
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
        compress: true
      });

      let data = await response.text(); 
      data = data.replace(/^\$@\$.+?\$@\$/, ''); // Menghapus karakter khusus dari respons

      resolve(data);
    } catch (error) {
      reject('Error:', error);
    }
  });
}

// Handler untuk mengaktifkan atau menonaktifkan Ambatron AI
let handler = async (m, { conn, text }) => {
  // Inisialisasi objek AI untuk menyimpan status pengguna
  conn.ambraGPT = conn.ambraGPT ? conn.ambraGPT : {};

  if (!text) throw `*Contoh:* .autoambatron *[on/off]*`;

  if (text === "on") {
    conn.ambraGPT[m.sender] = {
      messages: []
    };
    m.reply("[?] Berhasil mengaktifkan Ambatron AI.");
  } else if (text === "off") {
    delete conn.ambraGPT[m.sender];
    m.reply("[?] Berhasil menonaktifkan Ambatron AI.");
  }
};

// Handler sebelum pesan diolah untuk memeriksa apakah pengguna sudah mengaktifkan Ambatron AI
handler.before = async (m, { conn }) => {
  conn.ambraGPT = conn.ambraGPT ? conn.ambraGPT : {};
  if (m.isBaileys && m.fromMe) return;
  if (!m.text) return;
  if (!conn.ambraGPT[m.sender]) return;

  // Abaikan jika pesan adalah perintah
  if (
    m.text.startsWith(".") ||
    m.text.startsWith("#") ||
    m.text.startsWith("!") ||
    m.text.startsWith("/") ||
    m.text.startsWith("\\/")
  ) return;

  if (conn.ambraGPT[m.sender] && m.text) {
    let name = conn.getName(m.sender);
    await conn.sendMessage(m.chat, { react: { text: `?`, key: m.key } });

    try {
      // Panggil Ambatron AI untuk mendapatkan respons
      const response = await ambatronAi(m.text);
      await conn.sendMessage(m.chat, { react: { text: `?`, key: m.key } });
      m.reply(response);
      conn.ambraGPT[m.sender].messages = [
        { role: "system", content: `Anda sedang berbicara dengan Ambatron AI, dikembangkan oleh Vynaa Valerie.` },
        { role: "user", content: m.text }
      ];
    } catch (error) {
      console.error("Error:", error);
      m.reply("Maaf, terjadi kesalahan saat memproses permintaan Anda.");
    }
  }
};

// Command untuk mengaktifkan dan menonaktifkan Ambatron AI
handler.command = ['autoambatron'];
handler.tags = ["ai"];
handler.help = ['autoambatron *[on/off]*'];

export default handler;

import fetch from "node-fetch";
import * as cheerio from "cheerio";

async function searchRoleplai(query) {
  try {
    const response = await fetch(`https://roleplai.app/web/searchbot.php?f=1&q=${encodeURIComponent(query)}&t=&_=1725082834723`, {
      method: "GET",
      headers: {
        Accept: "*/*",
        "X-Requested-With": "XMLHttpRequest",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36",
        Referer: `https://roleplai.app/web/searchbot.php?f=1&q=${encodeURIComponent(query)}`
      }
    });
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const html = await response.text();
    const $ = cheerio.load(html);
    return $("li").map((i, el) => ({
      link: $(el).find("a.item").attr("href"),
      bid: $(el).find("a.item").attr("href").trim().split("=")[1],
      image: $(el).find("img.imaged").attr("src"),
      name: $(el).find("h4.mb-05").text(),
      description: $(el).find("div.text-muted").text().trim()
    })).get();
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
}

async function getRoleplaiAnswer(bid, query) {
  try {
    const params = new URLSearchParams({
      u: "TflXtuyrQ75379eeb40a883e5e4dbf25e7855343e3LWqjdlU1",
      q: query
    });
    const response = await fetch(`https://roleplai.app/web/chat.php?bid=${bid}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "*/*",
        "X-Requested-With": "XMLHttpRequest",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36",
        Referer: `https://roleplai.app/web/?b=${bid}&linkto=hotbots`
      },
      body: params.toString()
    });
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const html = await response.text();
    const $ = cheerio.load(html);
    return $(".bubble").map((_, el) => $(el).text()).get()[0];
  } catch (error) {
    console.error("Get answer error:", error);
    return null;
  }
}

const handler = async (m, { conn, args, usedPrefix, command }) => {
  db.data.dbai.roleplai = db.data.dbai.roleplai || {};
  const senderId = m.sender;
  db.data.dbai.roleplai[senderId] = db.data.dbai.roleplai[senderId] || {
    bid: null,
    key: {
      id: null
    }
  };

  const inputText = args.length ? args.join(" ") : m.quoted?.text || m.quoted?.caption || m.quoted?.description || null;

  switch (command) {
    case "roleplaisearch":
      if (!inputText) return m.reply(`Masukkan teks untuk pencarian bot.\nContoh penggunaan:\n*${usedPrefix}${command} Gojo*`);
      console.log('Processing roleplaisearch request...');
      try {
        const searchResults = await searchRoleplai(inputText);
        if (searchResults.length === 0) return m.reply("Tidak ditemukan bot yang sesuai.");
        
        // Constructing list message instead of buttons
        const sections = searchResults.map((result) => ({
          title: result.name,
          rows: [
            {
              title: result.name,
              description: result.description,
              rowId: `${usedPrefix}roleplaiset ${result.bid}`
            }
          ]
        }));

        const listMessage = {
          text: `Pilih bot dari hasil pencarian untuk "${inputText}".`,
          footer: "Informasi lebih lanjut dapat ditemukan di Roleplai.",
          title: "Roleplai Bot Search",
          buttonText: "Klik di sini",
          sections
        };

        await conn.sendMessage(m.chat, listMessage, { quoted: m });
        console.log('Roleplaisearch request processed successfully');
      } catch (error) {
        console.error("Search bot handler error:", error);
      }
      break;

    case "roleplaiset":
      if (!inputText) return m.reply(`Masukkan bid bot yang ingin diset.\nContoh penggunaan:\n*${usedPrefix}${command} 12345*`);
      if (db.data.dbai.roleplai[senderId]?.bid === inputText) return m.reply(`Bot dengan bid ${inputText} sudah diset sebelumnya.`);
      db.data.dbai.roleplai[senderId] = {
        bid: inputText,
        key: {
          id: null
        }
      };
      m.reply(`Bot dengan bid ${inputText} telah diset.`);
      break;

    case "roleplai":
      if (!db.data.dbai.roleplai[senderId]?.bid) return m.reply(`Bot belum diset. Gunakan *${usedPrefix}${command} set <bid>* untuk menyetelnya.`);
      if (!inputText) return m.reply(`Masukkan teks atau reply pesan dengan teks yang ingin diolah.\nContoh penggunaan:\n*${usedPrefix}${command} Hai, apa kabar?*`);
      console.log('Processing roleplai request...');
      try {
        const answer = await getRoleplaiAnswer(db.data.dbai.roleplai[senderId].bid, inputText);
        const {
          key: { id: keyId }
        } = await conn.reply(m.chat, `${answer}`, m);
        db.data.dbai.roleplai[senderId].key.id = keyId;
        console.log('Roleplai request processed successfully');
      } catch (error) {
        console.error("Handler " + command + " error:", error);
      }
      break;

    default:
      m.reply(`Perintah tidak dikenali. Gunakan salah satu perintah berikut:\n*${usedPrefix}roleplai*\n*${usedPrefix}roleplaiset*\n*${usedPrefix}roleplaisearch*`);
      break;
  }
};

handler.before = async (m, { conn }) => {
  if (m.isBaileys && m.fromMe) return;
  if (!m.text) return;
  if (m.isGroup) return;
  if (m.sender === 'status@broadcast') return;
  let chatbot = global.db.data.users[m.sender].chatbot;
  if (!chatbot || chatbot !== 'roleplai') return;

  if (
    m.text.startsWith(".") ||
    m.text.startsWith("#") ||
    m.text.startsWith("!") ||
    m.text.startsWith("/") ||
    m.text.startsWith("\\/")
  ) return;

  db.data.dbai.roleplai = db.data.dbai.roleplai || {};
  if (m.isBaileys || m.fromMe || !m.text) return;

  const senderId = m.sender;
  const roleplaiData = db.data.dbai.roleplai[senderId];

  // Cek apakah sender sudah menyetel bot bid
  if (!roleplaiData || !roleplaiData.bid) return;

  try {
    console.log('Processing request...'); 
    const answer = await getRoleplaiAnswer(roleplaiData.bid, m.text.trim());

    // Kirim balasan ke pengirim tanpa perlu mengutip pesan
    const { key: { id: newKeyId } } = await conn.reply(m.chat, `${answer}`, m);
    
    // Simpan ID pesan terakhir (optional)
    db.data.dbai.roleplai[senderId].key.id = newKeyId;
    console.log('Request processed successfully');
  } catch (error) {
    console.error("Handler before error:", error);
  }
};

handler.help = ["roleplai"];
handler.tags = ["ai"];
handler.command = /^(roleplai|roleplaiset|roleplaisearch)$/i;
export default handler;

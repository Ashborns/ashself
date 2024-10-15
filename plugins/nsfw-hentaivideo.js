import { load } from 'cheerio';
import fetch from 'node-fetch';

const getHentaiList = async () => {
  const page = Math.floor(Math.random() * 1153);
  const response = await fetch(`https://sfmcompile.club/page/${page}`);
  const htmlText = await response.text();
  const $ = load(htmlText);
  const hasil = [];

  $('#primary > div > div > ul > li > article').each(function (a, b) {
    hasil.push({
      title: $(b).find('header > h2').text(),
      link: $(b).find('header > h2 > a').attr('href'),
      category: $(b).find('header > div.entry-before-title > span > span').text().replace('in ', ''),
      share_count: $(b).find('header > div.entry-after-title > p > span.entry-shares').text(),
      views_count: $(b).find('header > div.entry-after-title > p > span.entry-views').text(),
      type: $(b).find('source').attr('type') || 'image/jpeg',
      video_1: $(b).find('source').attr('src') || $(b).find('img').attr('data-src'),
      video_2: $(b).find('video > a').attr('href') || ''
    });
  });

  return hasil;
};

const getCaption = (obj) => `
📝 *Title:* ${obj.title}
🔗 *Link:* ${obj.link}
🏷️ *Category:* ${obj.category}
📢 *Share Count:* ${obj.share_count}
👀 *Views Count:* ${obj.views_count}
🎞️ *Type:* ${obj.type}
`;

export const handler = async (m, { conn }) => {
  if (!db.data.chats[m.chat].nsfw && m.isGroup) return m.reply(global.nsfw);
  let user = global.db.data.users[m.sender].age;
  if (user < 17) m.reply('❎ Kamu belum cukup umur! Silakan kembali ketika kamu berusia di atas 18 tahun');
  
  conn.hentaiVid = conn.hentaiVid ? conn.hentaiVid : {};
  const list = await getHentaiList();
  const teks = list.map((obj, index) => `*${index + 1}.* ${obj.title}`).join('\n');

  let { key } = await conn.reply(m.chat, `🔧 Daftar Hasil:\n\n${teks}\n\nBalas pesan ini dengan nomor video yang ingin ditampilkan.`, m);

  conn.hentaiVid[m.chat] = {
    list,
    key,
    timeout: setTimeout(() => {
      conn.sendMessage(m.chat, { delete: key });
      delete conn.hentaiVid[m.chat];
    }, 60 * 1000)
  };
};

// Modify here: Change beforeHandler to handler.before
handler.before = async (m, { conn }) => {
  conn.hentaiVid = conn.hentaiVid ? conn.hentaiVid : {};

  // Ensure there's a message reply
  if (!m.quoted) return;

  // Retrieve data from conn.hentaiVid
  const { list, key, timeout } = conn.hentaiVid[m.chat] || {};
  if (!list || !key || !timeout) return;

  // Ensure the quoted message matches the key.id
  if (m.quoted.id !== key.id || !m.text) return;

  const index = parseInt(m.text.trim());
  if (isNaN(index) || index < 1 || index > list.length) {
    await conn.reply(m.chat, "⚠️ Masukkan nomor video yang valid.", m);
  } else {
    const selectedObj = list[index - 1];
    await conn.sendFile(m.chat, selectedObj.video_1 || selectedObj.video_2, '', getCaption(selectedObj), m);
    conn.sendMessage(m.chat, { delete: key });
    clearTimeout(timeout);
    delete conn.hentaiVid[m.chat];
  }
};

handler.help = ["hentaivideo"];
handler.tags = ["nsfw"];
handler.command = /^(hentaivid|hentaimp4|hentaivideo)$/i;
handler.limit = true;
handler.premium = true;
handler.nsfw = true;
handler.register = true;
handler.age = 18;

export default handler;

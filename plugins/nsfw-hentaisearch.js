import { load } from 'cheerio';
import axios from 'axios';

let handler = async (m, { conn, text }) => {
  if (!db.data.chats[m.chat].nsfw && m.isGroup) return m.reply(global.nsfw);
  
  let user = global.db.data.users[m.sender].age;
  if (user < 17) return m.reply('❎ Kamu belum cukup umur! Silakan kembali ketika kamu berusia di atas 18 tahun');
  
  if (!text) throw '*[❗] MASUKKAN NAMA HENTAI YANG AKAN DICARI*';

  m.reply(wait);

  try {
    let searchResults = await searchHentai(text);
    let teks = searchResults.result.map((v, i) => `
${i + 1}. *_${v.title}_*
↳ 📺 *_Views:_* ${v.views}
↳ 🎞️ *_Link:_* ${v.url}`).join('\n\n');

    let randomThumbnail;
    if (searchResults.result.length > 0) {
      let randomIndex = Math.floor(Math.random() * searchResults.result.length);
      randomThumbnail = searchResults.result[randomIndex].thumbnail;
    } else {
      randomThumbnail = 'https://pictures.hentai-foundry.com/e/Error-Dot/577798/Error-Dot-577798-Zero_Two.png';
      teks = '*[❗] TIDAK ADA HASIL PENCARIAN*';
    }

    await conn.sendFile(m.chat, randomThumbnail, 'error.jpg', teks, m);
  } catch (err) {
    console.error(err);
    m.reply('*[❗] Terjadi kesalahan saat melakukan pencarian*');
  }
};

handler.command = /^(carihentai)$/i;
handler.help = ['hentaisearch', 'searchhentai'];
handler.tags = ['nsfw'];
handler.register = true;
handler.age = 18;
handler.nsfw = true;
handler.premium = true;

export default handler;

async function searchHentai(search) {
  try {
    let { data } = await axios.get(`https://hentai.tv/?s=${encodeURIComponent(search)}`);
    let $ = load(data);
    let result = {
      coder: 'rem-comp',
      result: [],
      warning: "It is strictly forbidden to reupload this code, copyright © 2022 by rem-comp"
    };

    $('div.flex > div.crsl-slde').each((i, el) => {
      let _thumbnail = $(el).find('img').attr('src');
      let _title = $(el).find('a').text().trim();
      let _views = $(el).find('p').text().trim();
      let _url = $(el).find('a').attr('href');
      
      result.result.push({ thumbnail: _thumbnail, title: _title, views: _views, url: _url });
    });

    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch search results');
  }
}

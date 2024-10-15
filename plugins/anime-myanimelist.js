import fetch from 'node-fetch';
import cheerio from 'cheerio';

let handler = async (m, { conn }) => {
  const url = 'https://myanimelist.net/anime/season';

  try {
    const response = await fetch(url);
    const body = await response.text();
    const $ = cheerio.load(body);

    let animeList = [];
    $('.seasonal-anime').each((i, elem) => {
      const title = $(elem).find('.title h2').text().trim();
      const image = $(elem).find('.image img').attr('data-src') || $(elem).find('.image img').attr('src');
      const link = $(elem).find('.title a').attr('href');
      const score = $(elem).find('.score-label').text().trim() || 'N/A';
      const members = $(elem).find('.member').text().trim().replace(',', '') || 'N/A';
      
      const date = $(elem).find('.info .info2').text().trim() ||
                   $(elem).find('.eps').text().trim() ||
                   $(elem).find('.info').last().text().trim() ||
                   $(elem).find('.broadcast').text().trim() ||
                   $(elem).find('.premiere').text().trim() ||
                   'Unknown';

      animeList.push({ title, image, link, score, members, date });
    });

    if (animeList.length === 0) {
      return m.reply('🐱 Tidak ada anime yang ditemukan untuk musim ini.');
    }

    let message = '📺 *Anime Musim Ini:*\n\n';
    animeList.forEach((anime, index) => {
      message += `*${index + 1}. ${anime.title}*\n`;
      message += `👥 *Members*: ${anime.members}\n`;
      message += `⭐ *Score*: ${anime.score}\n`;
      message += `📅 *Rilis*: ${anime.date}\n`;
      message += `🔗 [Link](${anime.link})\n\n`;
    });

    let buffer = await fetch('https://files.catbox.moe/mhdie5.jpg').then(res => res.buffer());

    await conn.sendMessage(m.chat, {
      text: message,
      contextInfo: {
        externalAdReply: {
          title: "LIST ANIME BULAN INI",
          thumbnail: buffer,
          sourceUrl: "",
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    });

  } catch (e) {
    console.log(e);
    m.reply('🐱 Terjadi kesalahan saat mengambil data anime.');
  }
};

handler.help = ['myanimelist'];
handler.tags = ['anime'];
handler.command = /^myanimelist$/i;

export default handler;
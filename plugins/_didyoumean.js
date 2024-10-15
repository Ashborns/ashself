import didyoumean from 'didyoumean'
import similarity from 'similarity'

let handler = m => m;

handler.before = function (m, { match, usedPrefix }) {
  if ((usedPrefix = (match[0] || '')[0])) {
    let noPrefix = m.text.replace(usedPrefix, '').trim();
    let alias = Object.values(global.plugins).filter(v => v.help && !v.disabled).map(v => v.help).flat(1);
    let mean = didyoumean(noPrefix, alias);
    let sim = similarity(noPrefix, mean);
    let similarityPercentage = parseInt(sim * 100);

    if (mean && noPrefix.toLowerCase() !== mean.toLowerCase()) {
      let response = `❏ ᴄᴏᴍᴍᴀɴᴅ ᴛɪᴅᴀᴋ ᴅɪᴛᴇᴍᴜᴋᴀɴ!\n✧ ᴀᴘᴀᴋᴀʜ ᴀɴᴅᴀ ᴍᴇɴᴄᴀʀɪ: *${usedPrefix + mean}*\n✧ ᴋᴇᴍɪʀɪᴘᴀɴ: *${similarityPercentage}%*\n\nASH - CARE`;

      this.reply(m.chat, response, m, {
        contextInfo: {
          externalAdReply: {
            title: 'ᴅɪᴅ ʏᴏᴜ ᴍᴇᴀɴ?',
            body: 'ᴀᴜᴛʜ ʙʏ Ash',
            thumbnailUrl: 'https://telegra.ph/file/5151598c49563ae3291d9.jpg',
            sourceUrl: '-',
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      });
    }
  }
}

export default handler
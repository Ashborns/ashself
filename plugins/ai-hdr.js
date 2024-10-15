import fetch from 'node-fetch';
import uploadImage from '../lib/uploadImage.js';
import Jimp from 'jimp';

let processing = false;

let handler = async (m, { conn, usedPrefix, command, text }) => {
  if (processing) {
    return m.reply("Please wait, another image is being processed.");
  }

  processing = true;
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
  let name = await conn.getName(who);
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || '';
  if (!mime) {
    processing = false;
    throw `*Send or reply to an image*`;
  }

  conn.sendMessage(m.chat, { text: "Processing image, please wait..." });

  let media = await q.download();

  // Load the image using Jimp
  try {
    let image = await Jimp.read(media);

    // Increase contrast, resolution, and sharpen image
    image.contrast(0.7) // Increase contrast
         .resize(image.bitmap.width * 2, image.bitmap.height * 2, Jimp.RESIZE_BICUBIC) // Increase resolution
         .quality(95); // Increase quality to 95%

    let buffer = await image.getBufferAsync(Jimp.MIME_JPEG); // Get buffer

    let processedUrl = await uploadImage(buffer); // Upload image
    await conn.sendFile(m.chat, processedUrl, '', '*Here you go!*', m);
  } catch (err) {
    console.error(err);
    m.reply(`Failed to process the image. Please try again later: ${err}`);
  } finally {
    processing = false;
  }
}

handler.help = ['hd'];
handler.tags = ['tools'];
handler.command = /^(hd)$/i;
handler.limit = false;

export default handler;
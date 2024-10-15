import { scraper } from '@fongsidev/scraper';
import fetch from 'node-fetch';

const formatNumber = (num) => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'b';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'm';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'k';
    return num;
};

const downloadBuffer = async (url) => {
    const response = await fetch(url);
    return await response.buffer();
};

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) {
        throw `Masukkan URL!\n\ncontoh:\n${usedPrefix + command} https://www.tiktok.com/t/ZS2Fbcx8V/`;
    }
    try {
        if (!args[0].match(/tiktok/gi)) {
            throw `URL Tidak Ditemukan!`;
        }
        m.reply('*Mohon tunggu..*');
        const nama = await conn.getName(m.sender);
        const result = await scraper.TiktokVideo(args[0]);
        const { data: videoDetails } = result;

        if (videoDetails.images && videoDetails.images.length > 0) {
            // Jika ada images, ini adalah slideshow
            const thumbnailPromises = videoDetails.images.map(async (url, index) => {
                const thumbnailBuffer = await downloadBuffer(url);
                await conn.sendFile(m.chat, thumbnailBuffer, `thumbnail_${index}.jpg`, null, m, false, {
                    mimetype: 'image/jpeg'
                });
            });

            await Promise.all(thumbnailPromises);

            const caption = `
*====[ TikTok Slideshow ]====*
👤 | Name: ${videoDetails.author.nickname}
💙 | Username: ${videoDetails.author.unique_id}
#️⃣ | Title: ${videoDetails.title}
📼 | Duration: ${formatNumber(videoDetails.music_info.duration)}s
🌏 | Region: ${videoDetails.region}
`;

            const audioBuffer = videoDetails.music_info.play
            console.log(`Audio Buffer Size: ${audioBuffer.length}`);

            await conn.sendMessage(m.chat, {
                audio: { 
                url: audioBuffer
                },
                mimetype: 'audio/mpeg',
                contextInfo: {
                    forwardingScore: 999999,
                    isForwarded: true,
                    externalAdReply: {
                        title: 'Nih Sound Nya Kak',
                        body: `Hallo Kak, ${nama}👋`,
                        sourceUrl: args[0],
                        previewType: 1,
                        mediaType: 1,
                        thumbnailUrl: videoDetails.images[0],
                        renderLargerThumbnail: true
                    }
                }
            });
        } else {
            const videoBuffer = videoDetails.play
            const audioBuffer = videoDetails.music_info.play

            const caption = `
*====[ TikTok Video ]====*
👤 | Name: ${videoDetails.author.nickname}
💙 | Username: ${videoDetails.author.unique_id}
#️⃣ | Title: ${videoDetails.title}
📼 | Duration: ${formatNumber(videoDetails.music_info.duration)}s
🌏 | Region: ${videoDetails.region}
`;
            await conn.sendFile(m.chat, videoBuffer, 'video.mp4', caption, m);
            console.log(`Audio Buffer Size: ${audioBuffer.length}`);

            await conn.sendMessage(m.chat, {
                audio: { url:
                audioBuffer
                },
                mimetype: 'audio/mpeg',
                contextInfo: {
                    forwardingScore: 999999,
                    isForwarded: true,
                    externalAdReply: {
                        title: 'Nih Sound Nya Kak',
                        body: `Hallo Kak, ${nama}👋`,
                        sourceUrl: args[0],
                        previewType: 1,
                        mediaType: 1,
                        thumbnailUrl: videoDetails.cover,
                        renderLargerThumbnail: true
                    }
                }
            });
        }
    } catch (e) {
        console.error(e);
        throw(e);
    }
};

handler.help = ['tiktok3'];
handler.command = [/^tiktok3$/i];
handler.tags = ['downloader'];
handler.limit = true;
handler.group = false;
handler.premium = false;
handler.owner = false;
handler.admin = false;
handler.botAdmin = false;
handler.fail = null;
handler.private = false;

export default handler;
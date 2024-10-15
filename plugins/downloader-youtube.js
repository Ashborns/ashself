const {
    proto,
    generateWAMessageFromContent,
    generateWAMessageContent
  } = (await import("@adiwajshing/baileys"))["default"];
import ytdl from '@distube/ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import yts from 'yt-search';
import fs from 'fs';

let handler = async (m, { conn, text, command }) => {
    if (!text) throw "Kirimkan Perintah *.ytmp4/ytmp3 link* untuk mendownload video/audio\n\nKirim perintah *.play nama video* untuk mencari video"

    try {
        async function createImageMessage(imageUrl) {
            const { imageMessage } = await generateWAMessageContent({
                'image': {
                    'url': imageUrl
                }
            }, {
                'upload': conn.waUploadToServer
            });
            return imageMessage;
        }

        await conn.sendMessage(m.chat, { react: { text: `⏱️`, key: m.key }});
        if (command === 'play') {
            let search = await yts(text)
            if (!search) throw "Video Tidak Ditemukan"

            if (m.isGroup) {
                let { data, status, message } = await quality(search.videos[0].url, 9);
                if (!status) throw message

                const title = `TITLE BERHASIL DI DAPATKAN\n\nJudul : ${data.title}\nUpload : ${data.uploadDate}\nSize : ${data.size / 1024 / 1024} MB\nViews : ${data.views}\nLike : ${data.likes}\nDislike : ${data.dislike}\nChannel : ${data.channel}\nDeskripsi : ${data.desc}\n\nMOHON TUNGGU SEDANG MENGIRIM MEDIA`
    
                let button = {
                    text: title,
                    contextInfo: {
                        externalAdReply: {
                            title: data.title,
                            body: data.desc,
                            thumbnailUrl: data.thumb,
                            sourceUrl: text,
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                };
        
                await conn.sendMessage(m.chat, button, { quoted: m });
    
                await conn.sendMessage(m.chat, { react: { text: `✅`, key: m.key }});

                return conn.sendMessage(m.chat, { audio: { url: data.videoPath }, mimetype: 'audio/mp4', fileName: `${data.title}.mp3` }, { quoted: m })
            }

            let playResult = [];

            for (let i = 0; i < Math.min(3, search.videos.length); i++) {
                let randomAnu = search.videos[i];
                playResult.push({
                    'body': proto.Message.InteractiveMessage.Body.fromObject({
                        'text': `*[ ${randomAnu.title} ]*\n⭔ Duration : ${randomAnu.timestamp}\n⭔ Author : ${randomAnu.author.name}\n⭔ Channel : ${randomAnu.author.url}`
                    }),
                    'footer': proto.Message.InteractiveMessage.Footer.fromObject({
                        'text': "乂 Y O U T U B E"
                    }),
                    'header': proto.Message.InteractiveMessage.Header.fromObject({
                        'title': "Hasil.",
                        'hasMediaAttachment': true,
                        'imageMessage': await createImageMessage(randomAnu.thumbnail)
                    }),
                    'nativeFlowMessage': proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                        'buttons': [
                            {
                                name: "quick_reply",
                                buttonParamsJson: JSON.stringify({
                                    display_text: "Download Video", // <-- displayed text
                                    id: `.ytmp4 ${randomAnu.url}` // <-- this is the id or you may call it command 🤷‍♂️
                                })
                            },
                            {
                                name: "quick_reply",
                                buttonParamsJson: JSON.stringify({
                                    display_text: "Download Audio", // <-- displayed text
                                    id: `.ytmp3 ${randomAnu.url}` // <-- this is the id or you may call it command 🤷‍♂️
                                })
                            }
                        ]
                    })
                });
            }

            // Buat pesan carousel 
            const carouselMessage = generateWAMessageFromContent(m.chat, {
                'viewOnceMessage': {
                    'message': {
                        'messageContextInfo': {
                            'deviceListMetadata': {},
                            'deviceListMetadataVersion': 2
                        },
                        'interactiveMessage': proto.Message.InteractiveMessage.fromObject({
                            'body': proto.Message.InteractiveMessage.Body.create({
                                'text': "Pilih salah satu video dibawah ini"
                            }),
                            'footer': proto.Message.InteractiveMessage.Footer.create({
                                'text': "乂 Y O U T U B E"
                            }),
                            'header': proto.Message.InteractiveMessage.Header.create({
                                'hasMediaAttachment': false
                            }),
                            'carouselMessage': proto.Message.InteractiveMessage.CarouselMessage.fromObject({
                                'cards': [...playResult]
                            })
                        })
                    }
                }
            }, {});

            await conn.sendMessage(m.chat, { react: { text: `✅`, key: m.key }});

            // Kirim pesan carousel
            await conn.relayMessage(m.chat, carouselMessage.message, {
                'messageId': carouselMessage.key.id
            })
        } else {
            let format
            if (/^\d{1,3}\s.+$/.test(text)) [ format, text ] = text.split(" ");
            if (!/^(?:https?:\/\/)?(?:www\.|m\.|music\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/.test(text)) throw "Link YouTube Salah!"
            if (!format) format = /yt?(a|mp3)/i.test(command) ? 8 : 3

            let { data, status, message } = await quality(text, format)
            if (!status) throw message
            if (status === "mp3") {
                conn["other"] = conn["other"] || {}
				conn["other"][m.sender] = {
                    type: 'ytmp3',
					command: 'ytmp3',
					url: text,
					data: data.bitrateList
				};

				let messg = 'Pilih Salah Satu Audio Bitrate Berikut!\n\n'
				data.bitrateList.forEach((element, i) => {
					messg += `*[ ${i + 1} ]*\n> Bitrate: *${element.bitrate} kbps*\n> Codec: *${element.codec}*\n> Itag: *${element.itag}*\n\n`;
				});
				messg += 'Semakin besar bitrate, semakin bagus kualitasnya dan semakin besar juga ukurannya!'

				await m.reply(messg)

                await conn.sendMessage(m.chat, { react: { text: `✅`, key: m.key }});
                return
            }
    
            const title = `TITLE BERHASIL DI DAPATKAN\n\nJudul : ${data.title}\nUpload : ${data.uploadDate}\nSize : ${data.size / 1024 / 1024} MB\nViews : ${data.views}\nLike : ${data.likes}\nDislike : ${data.dislike}\nChannel : ${data.channel}\nDeskripsi : ${data.desc}\n\nMOHON TUNGGU SEDANG MENGIRIM MEDIA`
    
            let button = {
                text: title,
                contextInfo: {
                    externalAdReply: {
                        title: data.title,
                        body: data.desc,
                        thumbnailUrl: data.thumb,
                        sourceUrl: text,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            };
    
            await conn.sendMessage(m.chat, button, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: `✅`, key: m.key }});

            if (format >= 8) {
                await conn.sendMessage(m.chat, { audio: { url: data.videoPath }, mimetype: 'audio/mp4', fileName: `${data.title}.mp3` }, { quoted: m })
            } else {
                await conn.sendFile(m.chat, data.result, "", "", m)
            }
        }
    } catch (e) {
        console.log(e);
        throw e
    }
};

handler.before = async (m, { conn, caption }) => {
    if (!conn.other?.[m.sender] || !conn.other[m.sender].type === 'ytmp3') return

    if (m.isBaileys && m.fromMe) return;
    if (!m.text) return;

    let { url, data } = conn.other[m.sender]

    caption = data[m.text - 1] ? `${data[m.text - 1].itag} ${url}` : null

    let messg = 'Pilih Salah Satu Audio Bitrate Berikut!\n\n'
    data.forEach((element, i) => {
        messg += `*[ ${i + 1} ]*\n> Bitrate: *${element.bitrate} kbps*\n> Codec: *${element.codec}*\n> Itag: *${element.itag}*\n\n`;
    });                        
    messg += 'Semakin besar bitrate, semakin bagus kualitasnya dan semakin besar juga ukurannya!'
    if (!caption) throw 'Audio Bitrate Tidak Ditemukan!'

    handler(m, { conn, text: caption, command: 'ytmp3' }).then(() => {
        delete conn.other[m.sender]
    })
}

async function quality(link, qualitys) {
    try {
        let quality = ['160', '134', '135', ['302','136','247'], ['303', '248'], ['308', '271'], ['315', '313'], 'mp3', 'highestaudio'][qualitys - 1] || '134'; // 134:360p || 135:480p || 136:720p || 248:1080p || 271:1440p || 313:2160p
        if (qualitys > 100) quality = qualitys;

        const info = await ytdl.getInfo(link);
        console.log('Video info retrieved.');

        if (quality === 'mp3') {
			let bitrateList = [];
			info.formats.forEach(element => {
				if (!element.hasVideo && element.hasAudio) {
					const isDuplicate = bitrateList.some(item => item.itag === element.itag);
					
					if (!isDuplicate) {
						bitrateList.push({
							codec: element.codecs,
							bitrate: element.audioBitrate,
							itag: element.itag
						});
					}
				}
			});
			

            return {
                status: "mp3",
                data: {
                    bitrateList: bitrateList.sort((a, b) => b.bitrate - a.bitrate)
                }
            }
        }

        const videoDetails = info.videoDetails;
        const thumb = info.player_response.microformat.playerMicroformatRenderer.thumbnail.thumbnails[0].url;

        let format = null;

        if (Array.isArray(quality)) {
            for (const q of quality) {
                try {
                    format = await ytdl.chooseFormat(info.formats, { quality: q });
                    if (format) break; // Exit the loop if a format is found
                } catch (e) {
                    format = null;
                }
            }
        } else if (qualitys <= 7 || quality === '134') {
            format = await ytdl.chooseFormat(info.formats, { quality: quality });
        }

        if ((!format && qualitys <= 7) || (!format && quality === '134')) {
			const vidQuality = ['144', '360', '480', '720', '1080', '1440', '2160'];
            throw new Error(`No Video found with quality '${vidQuality[qualitys - 1]}'P.`);
        }

        if (qualitys > 100 || quality === 'highestaudio') {
            const checkQuality = await ytdl.chooseFormat(info.formats, { quality });
            if (!checkQuality) throw new Error(`No format found!`);
            const audioStream = ytdl.downloadFromInfo(info, { quality });
            const tempMp3 = `./tmp/temp_audio_${Date.now()}.mp3`;

            console.log('Downloading audio...');
            await new Promise((resolve, reject) => {
                const writeStream = fs.createWriteStream(tempMp3);
                audioStream.pipe(writeStream);
                audioStream.on('end', resolve);
                audioStream.on('error', reject);
            });
            console.log('Audio download complete.');

            const mp3Buffer = fs.readFileSync(tempMp3);

            return {
                status: true,
                data: {
                    title: videoDetails.title,
                    result: mp3Buffer,
                    videoPath: tempMp3,
                    size: mp3Buffer.length,
                    quality: quality,
                    desc: videoDetails.description,
                    views: videoDetails.viewCount,
                    likes: videoDetails.likes,
                    dislikes: videoDetails.dislikes,
                    channel: videoDetails.ownerChannelName,
                    uploadDate: videoDetails.uploadDate,
                    thumb,
                },
            };
        } else {
            const videoStream = ytdl.downloadFromInfo(info, { quality: quality });
            const audioStream = ytdl.downloadFromInfo(info, { quality: 'highestaudio' });

            const mp4File = `./tmp/buff_${Date.now()}.mp4`;
            const tempMp4 = `./tmp/temp_video_${Date.now()}.mp4`;
            const tempMp3 = `./tmp/temp_audio_${Date.now()}.mp4`;

            console.log('Downloading audio and video...');
            await Promise.all([
                new Promise((resolve, reject) => {
                    const writeStream = fs.createWriteStream(tempMp3);
                    audioStream.pipe(writeStream);
                    audioStream.on('end', resolve);
                    audioStream.on('error', reject);
                }),
                new Promise((resolve, reject) => {
                    const writeStream = fs.createWriteStream(tempMp4);
                    videoStream.pipe(writeStream);
                    videoStream.on('end', resolve);
                    videoStream.on('error', reject);
                }),
            ]);
            console.log('Audio and video download complete.');

            console.log('Merging audio and video...');
            await new Promise((resolve, reject) => {
                ffmpeg()
                    .input(tempMp3)
                    .input(tempMp4)
                    .outputOptions('-c:v copy')
                    .outputOptions('-c:a aac')
                    .outputOptions('-strict experimental')
                    .on('end', () => {
                        console.log('Merge complete.');
                        fs.unlinkSync(tempMp3);
                        fs.unlinkSync(tempMp4);
                        resolve();
                    })
                    .on('error', (err) => {
                        console.error('Error during merge:', err);
                        reject(err);
                    })
                    .save(mp4File);
            });

            const mp4Buffer = fs.readFileSync(mp4File);

            return {
                status: true,
                data: {
                    title: videoDetails.title,
                    result: mp4Buffer,
                    videoPath: mp4File,
                    size: mp4Buffer.length,
                    quality: quality,
                    desc: videoDetails.description,
                    views: videoDetails.viewCount,
                    likes: videoDetails.likes,
                    dislikes: videoDetails.dislikes,
                    channel: videoDetails.ownerChannelName,
                    uploadDate: videoDetails.uploadDate,
                    thumb,
                },
            };
        }
    } catch (err) {
        console.error('Error:', err);
        return { status: false, message: err.message };
    }
}

handler.help = ["yts <query>", "play <query>", "ytmp3 <link>", "ytmp4 <link>"];
handler.tags = ["downloader"];
handler.command = /^(yts|play|ytmp3|ytmp4)$/i;

export default handler;
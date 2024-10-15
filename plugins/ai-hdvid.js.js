import { fileURLToPath } from 'url'; // Import fileURLToPath function
import { join, dirname } from 'path'; // Import join and dirname functions
import { promises } from 'fs';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url); // Get current file path
const __dirname = dirname(__filename); // Get current directory path

const handler = async (m, { conn, text, usedPrefix, args, command }) => {
  conn.hdvid = conn.hdvid ? conn.hdvid : {};
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';

  if (!mime) throw `Kirim/Balas video dengan caption *${usedPrefix}${command}*`;

  // React with a loading emoji when the process starts
  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

  try {
    // Download video buffer
    const videoBuffer = await q.download();
    const videoFilePath = join(__dirname, '../tmp', `${+new Date()}.mp4`);
    await promises.writeFile(videoFilePath, videoBuffer);

    // Get video dimensions using ffprobe
    const { width, height } = await getVideoDimensions(videoFilePath);

    if (!width || !height) throw 'Tidak dapat mengambil dimensi video.';

    // Ensure valid 'text' input and assign FFmpeg options based on user choice
    let additionalFFmpegOptions;
    if (text === '1' || text === '2') {
      additionalFFmpegOptions = [
        '-c:v', 'libx264',
        '-crf', text === '1' ? (args[2] || '10') : (args[2] || '5'),
        '-b:v', args[1] || '8M',
        '-s', `${width * (text === '1' ? 2 : 3)}x${height * (text === '1' ? 2 : 3)}`,
        '-x264opts', 'keyint=30:min-keyint=30',
      ];
    } else {
      throw 'Pilih level:\n\n[1]. 1 (medium)\n[2]. 2 (HD)';
    }

    // Set additional FFmpeg options
    const additionalArgs = [
      ...additionalFFmpegOptions,
      '-q:v', '60',
    ];

    // Call video convert function
    const buff = await videoConvert(videoFilePath, additionalArgs);

    // Send result file back to the chat
    await conn.sendFile(m.chat, buff, '', 'Selesai', m);

    // React with a success emoji when done
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
  } catch (error) {
    console.error('Error during video processing:', error);
    // React with an error emoji in case of failure
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
  }
};

handler.help = ['hdvideo *<level>*'];
handler.tags = ['ai','menuprem'];
handler.command = /^(hdvideo|hdvideos|hdvid)$/i;
handler.premium = true;
handler.register = true;

export default handler;

async function getVideoDimensions(filePath) {
  return new Promise((resolve, reject) => {
    const ffprobe = spawn('ffprobe', [
      '-v', 'error',
      '-select_streams', 'v:0',
      '-show_entries', 'stream=width,height',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      filePath
    ]);

    let output = '';
    let errorOutput = '';

    ffprobe.stdout.on('data', (data) => {
      output += data.toString();
    });

    ffprobe.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    ffprobe.on('close', () => {
      const [width, height] = output.trim().split('\n').map(Number);
      if (width && height) {
        resolve({ width, height });
      } else {
        reject(`Gagal mengambil dimensi video. Error: ${errorOutput}`);
      }
    });

    ffprobe.on('error', (error) => {
      reject(error);
    });
  });
}

async function videoConvert(filePath, input = []) {
  return new Promise(async (resolve, reject) => {
    try {
      const out = filePath.replace('.mp4', '_converted.mp4');
      const args = [
        '-y',
        '-i', filePath,
        ...input,
        out
      ];

      // Run FFmpeg process
      const ffmpegProcess = spawn('ffmpeg', args);

      // Optionally log FFmpeg stdout data if needed
      // ffmpegProcess.stdout.on('data', (data) => {
      //   console.log(`FFmpeg stdout: ${data}`);
      // });

      // Suppress FFmpeg stderr output
      ffmpegProcess.stderr.on('data', () => {});

      ffmpegProcess.on('error', (error) => {
        console.error('FFmpeg error:', error);
        reject(error);
      });

      ffmpegProcess.on('close', async (code) => {
        try {
          if (code !== 0) {
            console.error(`FFmpeg exited with code ${code}`);
            return reject(new Error(`FFmpeg exited with code ${code}`));
          }
          const outputVideoBuffer = await promises.readFile(out);
          await promises.unlink(out);
          resolve(outputVideoBuffer);
        } catch (e) {
          reject(e);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
}

import WebSocket from 'ws';

let handler = async (m, { conn, command, text }) => {
    if (!text) throw 'Example: highly detailed, intricate, 4k, 8k, sharp focus, detailed hair, detailed';

    // Inform the user that the request is being processed
    m.reply('Please wait, generating your image...');

    try {
        const result = await gsdxl(text)

        if (!result) {
            throw 'Failed to generate image'
        }
        let buffer

        for(let i = 0; i < result.output.data[0].length; i++) {
            buffer = base64ToBuffer(result.output.data[0][i])
            await conn.sendFile(m.chat, buffer, '', '', m)
            await new Promise(resolve => setTimeout(resolve, 1000))
        }
    } catch (error) {
        // Handle any errors that occurred during the fetch
        m.reply(`Error: ${error.message}`);
    }
};

handler.help = ['sdxl <prompt>'];
handler.tags = ['ai'];
handler.command = ['sdxl'];
handler.limit = true;

export default handler;

async function gsdxl(prompt, trys = 0) {
    return new Promise((resolve, reject) => {
        try {
            const hash = generateRandomString(11);
            const ws = new WebSocket('wss://google-sdxl.hf.space/queue/join?__theme=light');

            // Tunggu hingga koneksi berhasil
            ws.on('open', () => {
                console.log('Koneksi WebSocket berhasil!');
            });

            // Tangani pesan yang diterima
            ws.on('message', async (message) => {
                const data = JSON.parse(message);

                if (data.msg === 'send_hash') {
                    const payload = {
                        fn_index: 3,
                        session_hash: hash
                    };
                    console.log('Mengirim hash:', payload);
                    ws.send(JSON.stringify(payload));
                }

                if (data.msg === 'send_data') {
                    const payload = {
                        data: [
                            prompt,
                            "lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, artist name, ",
                            7.5,
                            '(No style)'
                        ],
                        event_data: null,
                        fn_index: 3,
                        session_hash: hash
                    };
                    console.log('Mengirim data:', payload);
                    ws.send(JSON.stringify(payload));
                }

                if (data.msg === 'process_completed') {
                    ws.close();
                    if (data.output.error) {
                        ws.close();
                        reject(data.output.error);
                    }
                    resolve(data);
                }

                if (data.msg === 'queue_full') {
                    ws.close();
                    if (trys >= 5) {
                        reject('Queue full!');
                    }
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    return gsdxl(prompt, trys + 1);
                }
            });

            // Tangani kesalahan koneksi
            ws.on('error', (error) => {
                console.error('Terjadi kesalahan saat terhubung ke WebSocket:', error);
                reject(error);
            });

        } catch (error) {
            console.error('Terjadi kesalahan:', error);
            reject(error);
        }
    });
}


function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function base64ToBuffer(base64String) {
    // Hapus data URL scheme (e.g., "data:image/jpeg;base64,") agar hanya tersisa base64 string
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
    // Konversi base64 string menjadi buffer
    const buffer = Buffer.from(base64Data, 'base64');
    return buffer;
}

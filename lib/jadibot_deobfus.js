import { delay, DisconnectReason, areJidsSameUser, jidNormalizedUser, useMultiFileAuthState } from '@adiwajshing/baileys';
import qrcode from 'qrcode';
import { join } from 'path';
import { existsSync, promises as fs } from 'fs';
import { start, reload, authFolder } from './connection.js';
import connection from './connection.js'; // Assuming this is where your main connection is

const captionPairing = `Kode Pairing kamu: %code`.trim();
const captionQR = `
Scan kode QR ini untuk menjadi bot sementara.
Kode QR akan expired dalam %time detik.

QR Count: %count/3
`.trim();

// Function to handle logging and sending messages (can be customized)
const logAndSendMessage = async (chat, message, msg) => {
    if (connection.logger) {
        connection.logger.info(message);
    }
    if (msg) {
        await msg.reply(message);
    } else {
        console.log(message);
    }
};

export async function Jadibot(jid, logger = connection.logger, msg = null, usePairingCode = false) {
    jid = jidNormalizedUser(jid);
    if (jid && jid.startsWith('0')) jid = '62' + jid.slice(1) + '@s.whatsapp.net';

    const jidPrefix = jid && jid.split('@')[0];
    if (!jidPrefix) throw new Error('Invalid JID');

    const bot = await startBot(jid, logger, msg, usePairingCode);

    // Handle JID mismatch (if the bot logs in with a different JID)
    if (bot && bot.user?.jid && !areJidsSameUser(bot.user.jid, jid)) {
        console.log('JID mismatch, expected:', jid, 'got:', bot.user.jid);
        try {
            await bot.end();
            const expectedAuthFolder = join(authFolder, jidPrefix);
            const actualAuthFolder = join(authFolder, bot.user.jid.split('@')[0]);
            await fs.rename(expectedAuthFolder, actualAuthFolder);
            jid = bot.user.jid;
        } catch (error) {
            console.error(error);
            jid = null;
        } finally {
            if (!jid) throw new Error('Failed to start bot');
            connection.conns.delete(jidPrefix);
            await delay(750); // Wait before retrying
            return Jadibot(jid, logger, msg, usePairingCode);
        }
    }

    return bot;
}

export async function startBot(jid, logger = connection.logger, msg = null, usePairingCode) {
    let qrCount = 0;
    let qrMessage;

    const jidPrefix = jid.split('@')[0];
    const authPath = join(authFolder, jidPrefix);
    const existingBots = [...connection.conns.entries()].map(([, conn]) => conn.user?.jid);

    if (existingBots.includes(jid)) throw new Error('Bot already running');

    const { state, saveCreds } = await useMultiFileAuthState(authPath);
    const config = { authState: state, isChild: true, usePairingCode };
    const bot = await start(null, config);
    const qrCodeType = usePairingCode ? 'Pairing code' : 'QR code';

    // Function to handle logging and sending messages
    const logAndSend = async (...args) => logAndSendMessage(...args, msg);

    if (usePairingCode && !bot?.authState?.creds?.registered) {
        await delay(500);
        try {
            let pairingCode = await bot.requestPairingCode(jidPrefix);
            pairingCode = pairingCode?.match(/.{1,4}/g)?.join('-') || pairingCode;
            if (msg) {
                await logAndSend(msg.chat ?? jid, captionPairing.replace(/%code/g, pairingCode), msg);
                await logAndSend(msg.from ?? jid, String(pairingCode), msg);
            }
        } catch (error) {
            console.error(error);
            throw new Error('Failed to request pairing code');
        }
    }

    bot.ev.on('connection.update', async ({ qr, connection, lastDisconnect, isNewLogin }) => {
        if (qr && !usePairingCode && msg) {
            if (qrCount >= 3) {
                await logAndSend(msg.from, 'QRCode telah berakhir!');
                try {
                    bot.ws.close();
                } catch { }
                bot.ev.removeAllListeners();
                qrCount = 0;
                if (existsSync(authPath)) await fs.rm(authPath, { recursive: true }).catch(console.error);
                if (qrMessage && qrMessage?.key) await msg.delete(qrMessage.key);
            } else {
                if (qrMessage && qrMessage?.key) await msg.delete(qrMessage.key);
                qrCount++;
                try {
                    const qrBuffer = await qrcode.toBuffer(qr, {
                        scale: 8,
                        margin: 4,
                        width: 200,
                        color: { dark: '#000000ff', light: '#ffffffff' },
                    });
                    qrMessage = await logAndSend(
                        msg.chat,
                        qrBuffer,
                        'qr.png',
                        captionQR
                            .replace(/%time/g, bot?.ws?.qrTimeout?.remaining / 1000 || 20)
                            .replace(/%count/g, qrCount),
                        msg
                    );
                } catch (error) {
                    console.error(error);
                }
            }
        }

        const statusCode = lastDisconnect?.error?.output?.statusCode ?? lastDisconnect?.error?.output?.payload?.statusCode;
        const message = lastDisconnect?.error?.output?.payload?.message ?? lastDisconnect?.error?.output?.payload?.text;

        if (connection === 'close') {
            logger.error(`STATE: ${jidNormalizedUser(bot?.user?.jid ?? bot?.user?.id ?? '')}\nID: ${jidPrefix}\nReason: ${message}\nStatus: ${statusCode}`);
        } else if (connection === 'open' && !isNewLogin) {
            if (msg) await logAndSend(msg.from, 'Berhasil terhubung!', msg);
        }

        if (statusCode) {
            console.info('Handling status code of disconnect reason:', { status: statusCode, message });
            if (
                statusCode !== DisconnectReason.loggedOut &&
                statusCode !== DisconnectReason.connectionReplaced &&
                statusCode !== DisconnectReason.timedOut &&
                statusCode !== DisconnectReason.forbidden
            ) {
                await reload(bot, true, config).catch(console.error);
            } else if (statusCode === DisconnectReason.connectionLost) {
                console.info('Connection timed out, restarting...');
                await reload(bot, true, config).catch(console.error);
            } else if (statusCode === DisconnectReason.loggedOut) {
                console.info('Logged out or forbidden, stoping all events...');
                if (msg && !bot.authState?.creds?.registered) {
                    await logAndSend(msg.chat, `${qrCodeType} telah berakhir!`);
                    if (existsSync(authPath)) await fs.rm(authPath, { recursive: true }).catch(console.error);
                } else if (bot.authState?.creds?.registered) {
                    logger.info('Logged in');
                    await reload(bot, true, config).catch(console.error);
                } else if (statusCode === DisconnectReason.connectionReplaced || statusCode === DisconnectReason.forbidden) {
                    if (existsSync(authPath)) await fs.rm(authPath, { recursive: true }).catch(console.error);
                    console.info('Connection closed:', statusCode === DisconnectReason.connectionReplaced ? 'Connection replaced' : 'Forbidden');
                    if (connection.conns.has(jidPrefix)) connection.conns.delete(jidPrefix);
                    const chat = msg?.chat || bot?.user?.jid || jid;
                    const reason = statusCode === DisconnectReason.connectionReplaced ? 'Logged out' : 'Forbidden';
                    await logAndSend(chat, `Koneksi ditutup: ${reason}, bot telah dihentikan!`, msg);
                }
            }
        }

        if (isNewLogin) {
            logger.info(`${jidPrefix}`, 'Logged in');
            if (msg) {
                let reply = await msg.reply('OK!');
                await delay(1000);
                await bot.sendMessage(msg.chat, 'Berhasil terhubung!', reply);
            }
        }
    });

    // Wait for the bot to be fully connected
    let tries = 0;
    const waitForConnection = () =>
        new Promise((resolve) => {
            if (bot?.user?.jid) {
                resolve();
            } else {
                tries++;
                setTimeout(() => resolve(waitForConnection()), 750);
            }
        });
    await waitForConnection();

    if (bot?.user?.jid && !existingBots.includes(bot.user.jid)) connection.conns.set(jidPrefix, bot);

    return bot;
}

export async function restoreSession(logger = null) {
    for (const file of await fs.readdir(authFolder)) {
        await delay(300);
        if (file.includes('parent')) continue;
        if (!existsSync(join(authFolder, file, 'creds.json'))) continue;
        if (connection.conns.has(file)) continue;
        await Jadibot(file + '@s.whatsapp.net', logger);
    }
}

export default Jadibot;
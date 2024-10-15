const tiktokRegex = /(?:https?:\/\/)?(?:www\.)?(?:tiktok\.com\/(?:@[a-zA-Z0-9._-]+\/video\/|v\/|embed\/|trending\/|@[\w.-]+|t\/[\w\-_]+)|vt\.tiktok\.com\/[\w\-_]+)/i;
const instagramRegex = /(?:https?:\/\/)?(?:www\.)?(?:instagram\.com\/(?:p|reel|tv)\/[\w\-_]+)/i;

export async function before(m, { isAdmin, isBotAdmin }) {
    if (m.isBaileys && m.fromMe) return;  // Mengabaikan pesan bot sendiri
    let chat = global.db.data.chats[m.chat];  // Mengambil data chat dari database global

    // Autodownload TikTok
    let tiktokMatch = tiktokRegex.exec(m.text);  // Simpan hasil exec() di variabel
    if (chat.autodownload && m.isGroup && tiktokMatch) {
        let tiktokLink = tiktokMatch[0];  // Mengambil link TikTok dari hasil exec()
        try {
            let res = await fetch(`https://api.kyuurzy.site/api/download/tiktok?query=${encodeURIComponent(tiktokLink)}`);
            let json = await res.json();
            if (json.status && json.result.no_watermark) {
                m.reply('🎬 Video TikTok berhasil ditemukan, mengunduh...');
                await this.sendFile(m.chat, json.result.no_watermark, 'tiktok.mp4', `Title: ${json.result.title}`, m);  // Mengirim video ke pengguna
            } else {
                m.reply('❌ Gagal mendownload video TikTok tanpa watermark.');
            }
        } catch (err) {
            m.reply('❌ Terjadi kesalahan saat memproses video TikTok.');
        }
    }

    // Autodownload Instagram
    let instagramMatch = instagramRegex.exec(m.text);  // Simpan hasil exec() di variabel
    if (chat.autodownload && m.isGroup && instagramMatch) {
        let instagramLink = instagramMatch[0];
        try {
            let res = await fetch(`https://api.agatz.xyz/api/instagram?url=${encodeURIComponent(instagramLink)}`);
            let json = await res.json();
            if (json.status === 200 && json.data.video[0].video) {
                m.reply('📸 Video Instagram berhasil ditemukan, mengunduh...');
                await this.sendFile(m.chat, json.data.video[0].video, 'instagram.mp4', `Title: Instagram Video`, m);  // Mengirim video ke pengguna
            } else {
                m.reply('❌ Gagal mendownload video Instagram.');
            }
        } catch (err) {
            m.reply('❌ Terjadi kesalahan saat memproses video Instagram.');
        }
    }
}

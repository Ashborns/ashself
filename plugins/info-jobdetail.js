import fetch from 'node-fetch';

let handler = async (m, { conn, text }) => {
    if (!text) {
        // Jika pengguna tidak memasukkan ID pekerjaan
        await conn.sendMessage(m.chat, { text: '🔍 *Masukkan ID pekerjaan yang ingin kamu cari!* \n\nContoh: `.jobdetail 3738360408`' }, m);
        return;
    }
/* JANGAN HAPUS INI 
SCRIPT BY © VYNAA VALERIE 
•• recode kasih credits 
•• contacts: (6282389924037)
•• instagram: @vynaa_valerie 
•• (github.com/VynaaValerie) 
*/

    // Kirim pesan loading saat mengambil data
    await conn.sendMessage(m.chat, { text: '⏳ *Mengambil detail pekerjaan...*' }, m);

    // ID pekerjaan dari input pengguna
    const jobId = encodeURIComponent(text);
    const apiUrl = `https://linkedin-data-api.p.rapidapi.com/get-job-details?id=${jobId}`;

    try {
        let response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': '6cf87a7b36mshe268db0435aae4ep198271jsn6d6dbeb1c212',
                'x-rapidapi-host': 'linkedin-data-api.p.rapidapi.com'
            }
        });
        let result = await response.json();

        if (result && result.data) {
            let job = result.data;
            let company = job.company;

            // Buat teks detail pekerjaan
            let jobDetails = `
💼 *${job.title}* (${job.state === "CLOSED" ? '❌ Ditutup' : '✅ Masih tersedia'})
🏢 *Perusahaan*: ${company.name}
🌐 *Lokasi*: ${job.location} ${job.workRemoteAllowed ? '(Remote diizinkan)' : ''}
⏳ *Diposting*: ${job.listedAtDate}
📅 *Tipe*: ${job.type}
🔗 [Lihat di LinkedIn](${job.url})
${job.applyMethod.companyApplyUrl ? `📝 [Apply via Company](${job.applyMethod.companyApplyUrl})` : ''}
🧑‍💻 *Deskripsi*: ${job.description}

*Tentang Perusahaan*:
🏢 *${company.name}*
📍 *Lokasi Kantor*: ${company.headquarter.line1}, ${company.headquarter.city}, ${company.headquarter.country}
👥 *Jumlah Pegawai*: ${company.staffCountRange.start} - ${company.staffCountRange.end} pegawai
🔗 [Profil Perusahaan](${company.url})
`;

            // Kirim hasil pencarian
            await conn.sendMessage(m.chat, { text: jobDetails }, m);
        } else {
            // Jika tidak ditemukan detail pekerjaan
            await conn.sendMessage(m.chat, { text: `⚠️ Tidak ditemukan detail untuk ID pekerjaan _"${text}"_.` }, m);
        }
    } catch (error) {
        console.error(error);
        // Kirim pesan error jika terjadi kesalahan saat mengambil data
        await conn.sendMessage(m.chat, { text: '❌ Terjadi kesalahan saat mengambil detail pekerjaan. Coba lagi nanti.' }, m);
    }
}

handler.help = ['jobdetail <id>'];
handler.tags = ['info'];
handler.command = /^(jobdetail)$/i;

export default handler;
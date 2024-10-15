import fetch from 'node-fetch';

function API(baseURL, endpoint, params) {
    const queryString = new URLSearchParams(params).toString();
    return `${baseURL}${endpoint}?${queryString}`; // Perbaiki sintaks template literal
}

let handler = async (m, { text, usedPrefix, command, conn }) => {
    if (!text) throw `Penggunaan:\n${usedPrefix + command} <teks>\n\nContoh:\n${usedPrefix + command} Jakarta`;

    let res = await fetch(API('https://api.openweathermap.org', '/data/2.5/weather', {
        q: text,
        units: 'metric',
        appid: '060a6bcfa19809c2cd4d97a212b19273'
    }));

    if (!res.ok) throw 'Lokasi tidak ditemukan';

    let json = await res.json();

    if (json.cod != 200) throw `Error: ${json.message}`; // Berikan pesan error yang lebih deskriptif

    const now = new Date();
    const checkTime = now.toLocaleDateString('id-ID') + ' ' + now.toLocaleTimeString('id-ID');

    const message = `
📍 Lokasi: ${json.name}
🌍 Negara: ${json.sys.country}
🌤️ Cuaca: ${json.weather[0].description}
🌡️ Suhu saat ini: ${json.main.temp} °C
🌡️ Suhu tertinggi: ${json.main.temp_max} °C
🌡️ Suhu terendah: ${json.main.temp_min} °C
💧 Kelembapan: ${json.main.humidity} %
💨 Angin: ${json.wind.speed} km/jam

🕒 Waktu pengecekan cuaca: ${checkTime}
🔗 Sumber: [OpenWeatherMap](https://openweathermap.org/)
    `.trim();

    await conn.sendMessage(m.chat, {
        text: message,
        contextInfo: {
            externalAdReply: {
                title: "CUACA HARI INI",
                thumbnailUrl: "https://f.uguu.se/gejXDuwx.jpg",
                sourceUrl: "https://openweathermap.org/",
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    });
};

handler.help = ['weather'];
handler.tags = ['internet'];
handler.command = /^(weather)$/i;

export default handler;

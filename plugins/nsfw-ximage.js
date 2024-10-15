import fetch from 'node-fetch';

let handler = async (m, { conn, text, command, usedPrefix }) => {
    // Daftar tag SFW dan NSFW
    let arrlist = [
        // SFW Tags
        "maid", "waifu", "marin-kitagawa", "mori-calliope", "raiden-shogun", 
        "oppai", "selfies", "uniform", "kamisato-ayaka",
        // NSFW Tags
        "ass", "hentai", "milf", "oral", "paizuri", "ecchi", "ero"
    ];
    
    // Jika input tidak valid atau tidak diberikan
    if (!arrlist.includes(text)) {
        let listnya = arrlist.map((v, index) => {
            return `[ ${++index} ] ${usedPrefix + command} ${v}`;
        }).join("\n");
        
        let htki = "🔔 *LIST TAGS* 🔔";
        let message = `${htki}
_Example: ${usedPrefix + command} paizuri_

${listnya}`;
        
        return m.reply(message);
    }
    
    // URL API dengan tag yang dipilih
    let url = `https://api.waifu.im/search?included_tags=${text}`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.images && data.images.length > 0) {
            const imageInfo = data.images[0];
            const caption = `
Signature: ${imageInfo.signature}
Extension: ${imageInfo.extension}
Image ID: ${imageInfo.image_id}
Favorites: ${imageInfo.favorites}
Source: ${imageInfo.source}
Width: ${imageInfo.width}
Height: ${imageInfo.height}
Byte Size: ${imageInfo.byte_size}
URL: ${imageInfo.url}
            `;
            const imageUrl = imageInfo.url;

            conn.sendFile(m.chat, imageUrl, null, caption, m);
        } else {
            conn.reply(m.chat, 'No anime images found.', m);
        }
    } catch (error) {
        console.error(error);
        conn.reply(m.chat, 'An error occurred while fetching the data.', m);
    }
}

handler.help = handler.command = ['ximage']
handler.tags = ['nsfw']
handler.limit = true

export default handler;

import { lyrics } from "@bochilteam/scraper";
import fetch from "node-fetch";
import Genius from "genius-lyrics";
import axios from "axios";
import { load } from "cheerio"; // Updated cheerio import

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let text;
    if (args.length >= 1) {
        text = args.slice(0).join(" ");
    } else if (m.quoted && m.quoted.text) {
        text = m.quoted.text;
    } else throw "Masukkan judul musik!\n*Example:* .lirik hello";

    let key = "h6fTn1BYNjYi5VTszhyAFTcM3WWtk2E4hqrXCcutfObE4jVFnJ3LVyewHKIYTli7";
    let Client = new Genius.Client(key);
    let song = await Client.songs.search(text);
    let nothing = "Tidak diketahui!";

    try {
        let bocil = await lyrics(text);
        let bocap = `*? Judul ?*
${bocil.title ? bocil.title : nothing}

*? Lirik ?*
${bocil.lyrics ? bocil.lyrics : nothing}

*? Penyanyi ?*
${bocil.author ? bocil.author : nothing}

*? Url ?*
${bocil.link ? bocil.link : nothing}

_By BochilTeam_
`;
        await m.reply(bocap);
    } catch (e) {
        try {
            let jenius = await song[0];
            let albert = `*? Judul ?*
${jenius.title ? jenius.title : nothing}

*? Lirik ?*
${await getLyrics(jenius.url)}

*? Penyanyi ?*
${(await jenius.artist).name ? (await jenius.artist).name : nothing}

*? Url ?*
${jenius.url ? jenius.url : nothing}

_By Genius_
`;
            await m.reply(albert);
        } catch (e) {
            try {
                const { data } = await axios.get("https://www.lyricsfreak.com/search.php?a=search&q=" + text);
                let $ = load(data); // Use the updated cheerio load function
                let h1 = $(".song");
                const hh = h1.attr("href");
                const huu = await axios.get("https://www.lyricsfreak.com" + hh);
                let s = load(huu.data); // Updated cheerio load function
                let h2 = s(".lyrictxt").text();
                let frank = `*? Lirik ?*\n${h2}\n\n_By lyricsfreak_`;
                await m.reply(frank);
            } catch (e) {
                throw e; // Fixed variable name to 'e'
            }
        }
    }
};

handler.help = ["lirik"].map(v => v + " <judul>");
handler.tags = ["internet"];
handler.command = /^l(irik(musik)?|yrics?)$/i;
export default handler;

async function getLyrics(url) {
    const response = await fetch("https://files.xianqiao.wang/" + url);
    const html = await response.text();
    const $ = load(html); // Updated cheerio load function
    let lyrics = '';
    $('div[class^="Lyrics__Container"]').each((i, elem) => {
        if ($(elem).text().length !== 0) {
            const snippet = $(elem)
                .html()
                .replace(/<br>/g, '\n')
                .replace(/<(?!\s*br\s*\/?)[^>]+>/gi, '');

            lyrics += $('<textarea/>').html(snippet).text().trim() + '\n\n';
        }
    });
    return lyrics;
}

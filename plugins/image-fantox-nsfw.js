import fetch from "node-fetch";

const htki = "🔔 *LIST* 🔔"; // Contoh pesan untuk htki

let handler = async (m, {
    conn,
    usedPrefix,
    text,
    args,
    command
}) => {
    if (!db.data.chats[m.chat].nsfw && m.isGroup) return m.reply(global.nsfw);
    
    let user = global.db.data.users[m.sender].age;
    if (user < 17) m.reply('❎ Kamu belum cukup umur! Silakan kembali ketika kamu berusia di atas 18 tahun');

    let arrlist = [
        "animal",
        "animalears",
        "anusview",
        "ass",
        "barefoot",
        "bed",
        "bell",
        "bikini",
        "blonde",
        "bondage",
        "bra",
        "breasthold",
        "breasts",
        "bunnyears",
        "bunnygirl",
        "chain",
        "closeview",
        "cloudsview",
        "cum",
        "dress",
        "drunk",
        "elbowgloves",
        "erectnipples",
        "fateseries",
        "fingering",
        "flatchest",
        "food",
        "foxgirl",
        "gamecg",
        "genshin",
        "glasses",
        "gloves",
        "greenhair",
        "hatsunemiku",
        "hcatgirl",
        "headband",
        "headdress",
        "headphones",
        "hentaimiku",
        "hentaivideo",
        "hloli",
        "hneko",
        "hololove",
        "horns",
        "inshorts",
        "japanesecloths",
        "necklace",
        "nipples",
        "nobra",
        "nsfwbeach",
        "nsfwbell",
        "nsfwdemon",
        "nsfwidol",
        "nsfwmaid",
        "nsfwmenu",
        "nsfwvampire",
        "nude",
        "openshirt",
        "pantyhose",
        "pantypull",
        "penis",
        "pinkhair",
        "ponytail",
        "pussy",
        "ribbons",
        "schoolswimsuit",
        "schooluniform",
        "seethrough",
        "sex",
        "sex2",
        "sex3",
        "shirt",
        "shirtlift",
        "skirt",
        "spreadlegs",
        "spreadpussy",
        "squirt",
        "stockings",
        "sunglasses",
        "swimsuit",
        "tail",
        "tattoo",
        "tears",
        "thighhighs",
        "thogirls",
        "topless",
        "torncloths",
        "touhou",
        "twintails",
        "uncensored",
        "underwear",
        "vocaloid",
        "weapon",
        "wet",
        "white",
        "whitehair",
        "wings",
        "withflowers",
        "withgun",
        "withpetals",
        "withtie",
        "withtree",
        "wolfgirl",
        "yuri"
    ];
    let listnya = arrlist.map((v, index) => {
        return `[ ${++index} ] ${usedPrefix + command} ${v}`;
    }).join("\n");
    let nah = `${htki}
_Example: ${usedPrefix + command} yuri_

${listnya}`;
    if (!arrlist.includes(text)) return m.reply(nah);
    await m.reply(wait);
    try {
        let ani = await fetch("https://fantox-apis.vercel.app/" + text);
        let mek = await ani.json();
        await conn.sendFile(m.chat, mek.url, "", `Nih kak ${m.name}`, m);
    } catch (e) {
        await m.reply(eror);
    }
};
handler.command = handler.help = ["fantox"];
handler.tags = ["nsfw"];
handler.age = 18
handler.premium = true
handler.nsfw = true
handler.register = true
export default handler;

import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command }) => {

    await m.reply(wait)

    // Fetch data from the 'blowjob' endpoint
    let res = await fetch('https://api.waifu.pics/nsfw/blowjob')

    if (!res.ok) return m.react('❌')

    let json = await res.json()

    if (!json.url) return m.react('❌')

    // Send the GIF file instead of a PNG
    await conn.sendFile(m.chat, json.url, 'blowjob.gif', '*RANDOM BLOWJOB*', m)

}

handler.help = ['blowjob']

handler.tags = ['nsfw']

handler.command = ['blowjob']

handler.nsfw = true

export default handler

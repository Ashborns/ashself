/* JANGAN HAPUS INI 
SCRIPT BY © VYNAA VALERIE 
•• recode kasih credits 
•• contacts: (6282389924037)
•• instagram: @vynaa_valerie 
•• (github.com/VynaaValerie) 
*/
import axios from 'axios'
import cheerio from 'cheerio'

let handler = async(m, { conn, text, args, command, usedPrefix}) => {
if (!text) throw 'Mana Kak Linknya?'
let url = `https://dlpanda.com/id?url=${text}&token=G7eRpMaa`
let response = await axios.get(url)
    const html = response.data;
    const $ = cheerio.load(html);
    let asd = []
    let imgSrc = []
    let creator = 'Jikarinka'
$('div.col-md-12 > img').each((index, element) => {
      imgSrc.push($(element).attr('src'));
    });

    asd.push({ creator, imgSrc })
  let fix = imgSrc.map((e,i) => {
  return {img: e, creator: creator[i] } 
  })

m.reply(wait)
for (let i of asd[0].imgSrc) {
     conn.sendFile(m.chat, i, '', null, m)
     }
}

handler.help = ['tiktokimg / ttimg <url>']
handler.tags = ['downloader']
handler.command = /^(ttimg|ttslide|tiktokslide)$/i
handler.register = true
handler.limit = true

export default handler
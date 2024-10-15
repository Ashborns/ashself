// SC BY © VYNAA CHAN
// RECODE WAJIB KASI CREDITS 
// WA: 6283896757978
// TOKO KEBUTUHAN BOT TERPERCAYA
// HANYA DI SINI
// https://linkbio.co/VLShop
// https://t.me/VynaaMD
import { tmpdir } from 'os'
import { join } from 'path'
import fs from 'fs'
import {readdirSync,statSync,unlinkSync,existsSync,readFileSync,watch} from 'fs'
let handler = async (m, { args, text }) => {

m.reply('Berhasil membersihkan file sessions')

function deleteFiles(sessions) {
  fs.readdir(sessions, (err, files) => {
    if (err) throw err;
    for (const file of files) {
      if (file !== 'creds.json') {
        fs.unlink(path.join(sessions, file), err => {
          if (err) throw err;
        });
      }
    }
  });
}
}
handler.help = ['clearsession']
handler.tags = ['owner']
handler.command = /^(c(lear)(sessi|session))$/i

handler.owners = true

export default handler
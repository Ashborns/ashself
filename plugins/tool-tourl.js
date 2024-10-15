import axios from 'axios'
import FormData from 'form-data'
import uploadImage from '../lib/uploadImage.js'

let handler = async (m) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  
  // Cek apakah ada media, jika tidak ada, kirim pesan "Mana medianya?"
  if (!mime) {
    return m.reply('Mana medianya? Balas dengan gambar atau video!')
  }

  let media = await q.download() // Download the media

  // Kirim pesan "Loading" saat proses upload dimulai
  m.reply('🔄 Loading, mohon tunggu...')

  // Upload to the default image uploader (uploadImage)
  let defaultLink = await uploadImage(media)

  // Prepare FormData for Widipe API
  let formData = new FormData()
  formData.append('file', media, {
    filename: 'image.png',  // You can dynamically extract file extension here if needed
    contentType: mime
  })

  // Make a POST request to Widipe API
  let widipeResponse = await axios.post('https://widipe.com/api/upload.php', formData, {
    headers: {
      ...formData.getHeaders()  // Include the necessary headers from FormData
    }
  })

  // Extract the result from Widipe API
  let widipeLink = widipeResponse.data.result.url

  // Kirim respon dengan kedua link
  m.reply(`📮 *L I N K :*\n${defaultLink}
📊 *S I Z E :* ${media.length} Byte

🌐 *Widipe Link:*\n${widipeLink}`)
}

handler.help = ['tourl (reply media)']
handler.tags = ['tools']
handler.command = /^(tourl|upload)$/i

export default handler
/* JANGAN HAPUS INI 
SCRIPT BY © VYNAA VALERIE 
•• recode kasih credits 
•• contacts: (6282389924037)
•• instagram: @vynaa_valerie 
•• (github.com/VynaaValerie) 
*/
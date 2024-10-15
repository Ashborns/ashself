let handler = async (m, { conn }) => {
    if (!m.quoted) throw 'Reply ke pesan dari saluran channel-nya.'
    
    try {
        let quotedObj = await m.getQuotedObj()
        console.log(quotedObj)

        let id = quotedObj.msg.contextInfo.forwardedNewsletterMessageInfo
        if (!id) throw 'Pesan yang dikutip bukan berasal dari saluran WhatsApp.'

        await m.reply(`Name: ${id.newsletterName}\nId: ${id.newsletterJid}`)
        
    } catch (e) {
        console.error(e)
        await m.reply('Error: Tidak bisa mendapatkan informasi saluran. Pastikan pesan yang dikutip berasal dari channel WhatsApp.')
    }
}

handler.help = ['ch']
handler.tags = ['group']
handler.command = /^(ch)$/i

handler.group = false

export default handler
/* JANGAN HAPUS INI 
SCRIPT BY © VYNAA VALERIE 
•• recode kasih credits 
•• contacts: (6282389924037)
•• instagram: @vynaa_valerie 
•• (github.com/VynaaValerie) 
*/

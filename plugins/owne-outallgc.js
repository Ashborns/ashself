let handler = async (m, { conn }) => {
    let groups = Object.keys(conn.chats).filter(jid => jid.endsWith('@g.us'));
    
    for (let i = 0; i < groups.length; i++) {
        await conn.groupLeave(groups[i]);
    }
    
    m.reply("Saya telah keluar dari semua grup.");
}

handler.command = /^outallgc$/i
handler.owner = true
export default handler
/*
SCRIPT BY © VYNAA VALERIE 
•• recode kasih credits 
•• contacts: (t.me/VLShop2)
•• instagram: @vynaa_valerie 
•• (github.com/VynaaValerie) 
*/
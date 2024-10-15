let war = global.maxwarn;

const handler = async (m, { conn, text, args, groupMetadata, usedPrefix, command }) => {      
    let who;
    if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false;
    else who = m.chat;
    if (!who) throw `✳️ Memberi label atau menyebut seseorang\n\n📌 Contoh : ${usedPrefix + command} @user`;
    if (!(who in global.db.data.users)) throw `✳️ Pengguna hilang dari database saya`;

    let name = conn.getName(m.sender);
    let warn = global.db.data.users[who].warn;

    if (warn < war) {
        global.db.data.users[who].warn += 1;

        // Notify the group about the warning
        m.reply(`⚠️ *Pengguna yang Diperingatkan* ⚠️\n\n▢ *Admin:* ${name}\n▢ *Pengguna:* @${who.split`@`[0]}\n▢ *Memperingatkan:* ${warn + 1}/${war}\n▢ *Alasan:* ${text}`, null, { mentions: [who] });

        // Notify the warned user
        m.reply(`⚠️ *PERINGATAN* ⚠️\nAnda menerima peringatan dari admin\n\n▢ *Memperingatkan:* ${warn + 1}/${war}\nJika Anda menerima *${war}* Peringatan bahwa Anda akan dihapus secara otomatis dari grup`, who);

        // Delete the message of the warned user
        if (m.isGroup && m.message) {
            conn.sendMessage(m.chat, { delete: m.key });
        }
    } else if (warn == war) {
        global.db.data.users[who].warn = 0;

        // Notify the group about the removal
        m.reply(`⛔ Pengguna melebihi peringatan *${war}* karena itu akan dihapus`);
        await time(3000);

        // Remove the user from the group
        await conn.groupParticipantsUpdate(m.chat, [who], 'remove');

        // Notify the removed user
        m.reply(`♻️ Anda tersingkir dari grup *${groupMetadata.subject}* karena Anda telah diperingatkan *${war}* kali`, who);
    }
};

handler.help = ['warn @user'];
handler.tags = ['group'];
handler.command = ['warn']; 
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;

const time = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

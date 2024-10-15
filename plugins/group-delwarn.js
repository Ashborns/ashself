// Use named exports for ESM
export const handler = async (m, { conn, args, groupMetadata }) => {
    let who;
    
    // Determine who the target user is
    if (m.isGroup) {
        who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false;
    } else {
        who = m.chat;
    }
    
    // Check if the target user is valid
    if (!who) {
        throw `✳️ Memberi label atau menyebut seseorang`;
    }
    
    // Check if the target user exists in the database
    if (!(who in global.db.data.users)) {
        throw `✳️ Pengguna hilang dari database saya`;
    }
    
    // Log the current state for debugging
    console.log('ID Pengguna:', who);
    console.log('Data Pengguna:', global.db.data.users[who]);
    
    // Get the current number of warnings
    let warn = global.db.data.users[who].warning;  // Use 'warning' instead of 'warn'
    
    // Check if the warning data is valid
    if (warn === undefined) {
        m.reply('✳️ Data peringatan tidak ditemukan');
        return;
    }
    
    // Handle the warning removal logic
    if (warn > 0) {
        global.db.data.users[who].warning -= 1;  // Use 'warning' instead of 'warn'
        m.reply(`⚠️ *PERINGATAN*\n\n▢ Memperingatkan: *-1*\n▢ Total Memperingatkan: *${warn - 1}*`);
        m.reply(`✳️ Seorang admin mengurangi peringatannya, sekarang Anda memiliki *${warn - 1}*`, who);
    } else if (warn === 0) {
        m.reply('✳️ Pengguna tidak memiliki peringatan');
    } else {
        m.reply('✳️ Terjadi kesalahan dalam membaca data peringatan');
    }
};

// Metadata
handler.help = ['delwarn @user'];
handler.tags = ['group'];
handler.command = ['delwarn', 'unwarn'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;

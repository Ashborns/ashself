const handler = async (m, { conn, text, command, usedPrefix, isOwner }) => {
  const changelogs = global.db.data.changelog || [];

  switch (command) {
      case 'changelog':
      case 'log':
          if (!changelogs.length) {
              return conn.reply(m.chat, 'There are no changelogs yet', m);
          }

          const caption = changelogs.map(changelog => {
              const [date, ...items] = changelog.split(' - ');
              return `• ${date}\n${items.map(item => `  ◦ ${item}`).join("\n")}`;
          }).join("\n\n");

          conn.reply(m.chat, caption, m, {
              contextInfo: {
                  externalAdReply: {
                      title: `${global.wm}`,
                      body: "C H A N G E L O G",
                      thumbnailUrl: 'https://telegra.ph/file/d55ca0aa48b18dfca4210.jpg',
                      sourceUrl: `${global.sig}`,
                      mediaType: 1,
                      renderLargerThumbnail: true
                  }
              }
          });
          break;

      case 'addchangelog':
          if (!isOwner) {
              return m.reply('🐱 Sorry, only the owner can use this command');
          }

          if (!text) {
              return m.reply(`Usage: ${usedPrefix}addchangelog <text>`);
          }

          changelogs.unshift(`${new Date().toDateString()} - ${text}`);
          global.db.data.changelog = changelogs;
          m.reply('🐱 Changelog has been added successfully');
          break;

      case 'rchangelog':
          if (!isOwner) {
              return m.reply('🐱 Sorry, only the owner can use this command');
          }

          if (!text) {
              return m.reply("Usage: " + usedPrefix + "rchangelog <text>");
          }

          const index = changelogs.findIndex(log => log.includes(text));
          if (index === -1) {
              return m.reply('🐱 Changelog not found, example:.rchangelog <date>');
          }

          changelogs.splice(index, 1);
          global.db.data.changelog = changelogs;
          m.reply('🐱 Changelog has been removed successfully');
          break;

      default:
          m.reply('Unknown command. Use !help to see available commands.');
          break;
  }
};

handler.help = ['changelog', 'log', 'addchangelog', 'rchangelog'];
handler.tags = ['info', 'main'];
handler.premium = false;
handler.command = /^(changelog|log|addchangelog|rchangelog)$/i;
handler.owner = false;

export default handler;
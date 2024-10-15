/* JANGAN HAPUS INI 
SCRIPT BY © VYNAA VALERIE 
•• recode kasih credits 
•• contacts: (6282389924037)
•• instagram: @vynaa_valerie 
•• (github.com/VynaaValerie) 
*/

import 'node-fetch';
const {
  proto,
  generateWAMessageFromContent,
  prepareWAMessageMedia
} = (await import("@adiwajshing/baileys"))["default"];
import '@bochilteam/scraper';

var handler = async (_0x154cf9, {
  conn: _0x3aa0f1,
  usedPrefix: _0x9f47d1,
  command: _0x28115d
}) => {
  if (!_0x28115d) {
    throw `Use example ${_0x9f47d1}${_0x28115d} anu`;
  }
  _0x154cf9.reply('⌛Loading...');
  try {
    let message = generateWAMessageFromContent(_0x154cf9.chat, {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2
          },
          interactiveMessage: proto.Message.InteractiveMessage.create({
            body: proto.Message.InteractiveMessage.Body.create({
              text: "> ʜᴇʟʟᴏ, ɪ ᴀᴍ ᴀ *ᴡʜᴀᴛꜱᴀᴘᴘ ʙᴏᴛ* ᴡʜᴏ ᴄᴀɴ ꜰᴜʟꜰɪʟʟ ʏᴏᴜʀ ᴅɪɢɪᴛᴀʟ ɴᴇᴇᴅꜱ. ᴀʀᴇ ʏᴏᴜ ꜰᴇᴇʟɪɴɢ ᴛɪʀᴇᴅ? ɪ ᴀᴍ ᴀʟᴡᴀʏꜱ ʜᴇʀᴇ ꜰᴏʀ ʏᴏᴜ ᴛᴏ ᴍᴀᴋᴇ ʏᴏᴜʀ ᴅᴀʏ ᴇᴀꜱɪᴇʀ.\n\n> ᴅᴏɴᴛ ꜰᴏʀɢᴇᴛ ᴛᴏ ʀᴇɢɪꜱᴛᴇʀ ʏᴏᴜʀꜱᴇʟꜰ ɪɴ ᴛʜᴇ ᴀᴡ ᴄᴏʀᴘ *ᴅᴀᴛᴀʙᴀꜱᴇ* ꜱᴏ ᴛʜᴀᴛ ᴀᴡ ᴄᴏʀᴘ ᴄᴀɴ ʀᴇᴍᴇᴍʙᴇʀ ʏᴏᴜ ᴀꜱ ʟᴏɴɢ ᴀꜱ ᴀᴡ ᴄᴏʀᴘ ʀᴇᴍᴀɪɴꜱ ᴀᴄᴛɪᴠᴇ."
            }),
            footer: proto.Message.InteractiveMessage.Footer.create({
              text: wm
            }),
            header: proto.Message.InteractiveMessage.Header.create({
              hasMediaAttachment: true,
              ...(await prepareWAMessageMedia({
                image: { url: "https://widipe.com/file/gLCPUuQQDe9C.png" }
              }, { upload: _0x3aa0f1.waUploadToServer }))
            }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
              buttons: [
                { name: "quick_reply", buttonParamsJson: "{\"display_text\":\"Menulist\",\"id\":\".listmenu\"}" },
                { name: "quick_reply", buttonParamsJson: "{\"display_text\":\"Menuall\",\"id\":\".allmenu\"}" }
              ]
            })
          })
        }
      }
    }, { quoted: _0x154cf9 });

    return await _0x3aa0f1.relayMessage(_0x154cf9.chat, message.message, {});
  } catch (error) {
    _0x3aa0f1.sendFile(_0x154cf9.chat, 'error.mp3', 'anu.mp3', null, _0x154cf9, true, {
      type: "audioMessage",
      ptt: true
    });
  }
};

handler.help = ["menu"];
handler.tags = ["menu"];
handler.command = /^(menu|help)$/i;
handler.limit = false;
handler.register = true;

export default handler;
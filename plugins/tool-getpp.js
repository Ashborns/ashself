/*
<>GETPP SUPPORT NOMOR (CONTOH .getpp +62123456)<>
SOURCE: https://whatsapp.com/channel/0029VaJYWMb7oQhareT7F40V
MAMPIR KESINI GUYS
wa.me/6285931969956?text=woi+tua+katanya+udah+dewasa+kok+main+bug+dek+panas+panas+🤮
DON'T DELETE THIS WM!,AKU JANJI TIDAK AKAN MENGHAPUS WM INI
RECODE BOLEH, TAPI INI WM JANGAN DIHAPUS!
*/

import fetch from "node-fetch";
/*
<>GETPP SUPPORT NOMOR (CONTOH .getpp +62123456)<>
SOURCE: https://whatsapp.com/channel/0029VaJYWMb7oQhareT7F40V
MAMPIR KESINI GUYS
wa.me/6285931969956?text=woi+tua+katanya+udah+dewasa+kok+main+bug+dek+panas+panas+🤮
DON'T DELETE THIS WM!,AKU JANJI TIDAK AKAN MENGHAPUS WM INI
RECODE BOLEH, TAPI INI WM JANGAN DIHAPUS!
*/
let handler = async (m, { conn, command, args }) => {
	try {
		let who;
	/*
<>GETPP SUPPORT NOMOR (CONTOH .getpp +62123456)<>
SOURCE: https://whatsapp.com/channel/0029VaJYWMb7oQhareT7F40V
MAMPIR KESINI GUYS
wa.me/6285931969956?text=woi+tua+katanya+udah+dewasa+kok+main+bug+dek+panas+panas+🤮
DON'T DELETE THIS WM!,AKU JANJI TIDAK AKAN MENGHAPUS WM INI
RECODE BOLEH, TAPI INI WM JANGAN DIHAPUS!
*/
		if (m.isGroup) {
			who = m.mentionedJid[0] 
				? m.mentionedJid[0] 
				: m.quoted 
					? m.quoted.sender 
					: args[0] 
						? args[0].replace(/[^0-9]/g, '').replace(/\s+/g, '') + '@s.whatsapp.net' 
						: m.sender;
		} else {
			who = m.quoted 
				? m.quoted.sender 
				: args[0] 
					? args[0].replace(/[^0-9]/g, '').replace(/\s+/g, '') + '@s.whatsapp.net' 
					: m.sender;
		}
		/*
<>GETPP SUPPORT NOMOR (CONTOH .getpp +62123456)<>
SOURCE: https://whatsapp.com/channel/0029VaJYWMb7oQhareT7F40V
MAMPIR KESINI GUYS
wa.me/6285931969956?text=woi+tua+katanya+udah+dewasa+kok+main+bug+dek+panas+panas+🤮
DON'T DELETE THIS WM!,AKU JANJI TIDAK AKAN MENGHAPUS WM INI
RECODE BOLEH, TAPI INI WM JANGAN DIHAPUS!
*/
		let pp = await conn
			.profilePictureUrl(who, "image")
			.catch((_) => "https://telegra.ph/file/24fa902ead26340f3df2c.png");
/*
<>GETPP SUPPORT NOMOR (CONTOH .getpp +62123456)<>
SOURCE: https://whatsapp.com/channel/0029VaJYWMb7oQhareT7F40V
MAMPIR KESINI GUYS
wa.me/6285931969956?text=woi+tua+katanya+udah+dewasa+kok+main+bug+dek+panas+panas+🤮
DON'T DELETE THIS WM!,AKU JANJI TIDAK AKAN MENGHAPUS WM INI
RECODE BOLEH, TAPI INI WM JANGAN DIHAPUS!
*/
		conn.sendFile(m.chat, pp, "nih bang.png", "Selesai....", m, {
			jpegThumbnail: await (await fetch(pp)).buffer(),
		});
	} catch {
		let sender = m.sender;
		let pp = await conn
			.profilePictureUrl(sender, "image")
			.catch((_) => "https://telegra.ph/file/24fa902ead26340f3df2c.png");
/*
<>GETPP SUPPORT NOMOR (CONTOH .getpp +62123456)<>
SOURCE: https://whatsapp.com/channel/0029VaJYWMb7oQhareT7F40V
MAMPIR KESINI GUYS
wa.me/6285931969956?text=woi+tua+katanya+udah+dewasa+kok+main+bug+dek+panas+panas+🤮
DON'T DELETE THIS WM!,AKU JANJI TIDAK AKAN MENGHAPUS WM INI
RECODE BOLEH, TAPI INI WM JANGAN DIHAPUS!
*/
		conn.sendFile(m.chat, pp, "ppsad.png", "Selesai....", m, {
			jpegThumbnail: await (await fetch(pp)).buffer(),
		});
	}
};
/*
<>GETPP SUPPORT NOMOR (CONTOH .getpp +62123456)<>
SOURCE: https://whatsapp.com/channel/0029VaJYWMb7oQhareT7F40V
MAMPIR KESINI GUYS
wa.me/6285931969956?text=woi+tua+katanya+udah+dewasa+kok+main+bug+dek+panas+panas+🤮
DON'T DELETE THIS WM!,AKU JANJI TIDAK AKAN MENGHAPUS WM INI
RECODE BOLEH, TAPI INI WM JANGAN DIHAPUS!
*/
handler.help = ["getpp <@𝒕𝒂𝒈/𝒓𝒆𝒑𝒍𝒚/𝒏𝒐𝒎𝒐𝒓>"];
handler.tags = ["group"];
handler.command = /^(getpp)$/i;
/*
<>GETPP SUPPORT NOMOR (CONTOH .getpp +62123456)<>
SOURCE: https://whatsapp.com/channel/0029VaJYWMb7oQhareT7F40V
MAMPIR KESINI GUYS
wa.me/6285931969956?text=woi+tua+katanya+udah+dewasa+kok+main+bug+dek+panas+panas+🤮
DON'T DELETE THIS WM!,AKU JANJI TIDAK AKAN MENGHAPUS WM INI
RECODE BOLEH, TAPI INI WM JANGAN DIHAPUS!
*/
export default handler;
/*
<>GETPP SUPPORT NOMOR (CONTOH .getpp +62123456)<>
SOURCE: https://whatsapp.com/channel/0029VaJYWMb7oQhareT7F40V
MAMPIR KESINI GUYS
wa.me/6285931969956?text=woi+tua+katanya+udah+dewasa+kok+main+bug+dek+panas+panas+🤮
DON'T DELETE THIS WM!,AKU JANJI TIDAK AKAN MENGHAPUS WM INI
RECODE BOLEH, TAPI INI WM JANGAN DIHAPUS!
*/
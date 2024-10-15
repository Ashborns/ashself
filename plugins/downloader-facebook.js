import axios from 'axios';

const handler = async (m, { args, conn, text }) => {
  if (!args[0]) {
    throw '*Contoh* : .fb https://www.facebook.com/xxxxxxx';
  }

  const apiKey = 'YOUR_API_KEY'; // Ganti YOUR_API_KEY dengan API key yang diberikan

  try {
    const response = await axios.get(`https://api.sanzy.bar/api/download?type=facebook&q=${args[0]}&apikey=${apiKey}`);
    const videoUrl = response.data.result.video_hd; // Sesuaikan dengan struktur respon dari API
    conn.sendMessage(m.chat, {
      react: {
        text: '💤',
        key: m.key,
      }
    });
    conn.sendFile(m.chat, videoUrl, 'fb.mp4', 'Video Facebook', m);
  } catch (error) {
    console.log(error);
    m.reply('Sepertinya ada masalah dalam mengunduh video.');
  }
};

handler.help = ['facebook ⧼url⧽'];
handler.tags = ['downloader'];
handler.command = /^(facebook|fb(dl|downloader)?)$/i;
export default handler;
/*
SCRIPT BY © VYNAA VALERIE 
•• recode kasih credits 
•• contacts: (t.me/VLShop2)
•• instagram: @vynaa_valerie 
•• (github.com/VynaaValerie) 
*/
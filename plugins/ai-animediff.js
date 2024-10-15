import fetch from 'node-fetch';

const api = {
  xterm: {
    url: "https://ai.xterm.codes",
    key: "Bell409" 
  }
};

let handler = async (m, { conn, command, text }) => {
    if (!text) throw 'Example: animediff prompt, negativePrompt';

    const [prompt, negativePrompt] = text.split(',');

    // Inform the user that the request is being processed
    m.reply('Please wait, generating your image...');

    try {
        const imgBuffer = await animediff(prompt.trim(), negativePrompt ? negativePrompt.trim() : '');

        if (!imgBuffer) {
            throw 'Failed to generate image';
        }
        
        await conn.sendFile(m.chat, Buffer.from(imgBuffer), '', '', m);
    } catch (error) {
        m.reply(`Error: ${error.message}`);
    }
};

handler.help = ['animediff <prompt>, <negativePrompt>'];
handler.tags = ['ai'];
handler.command = ['animediff'];
handler.limit = true;

export default handler;

async function animediff(prompt, negativePrompt) {
  try {
    const response = await fetch(`${api.xterm.url}/api/text2img/animediff?prompt=${encodeURIComponent(prompt)}&negativePrompt=${encodeURIComponent(negativePrompt)}&key=${api.xterm.key}`);

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const imgBuffer = await response.arrayBuffer();
    return imgBuffer;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

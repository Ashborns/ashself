/* JANGAN HAPUS INI 
SCRIPT BY © VYNAA VALERIE 
•• recode kasih credits 
•• contacts: (6282389924037)
•• instagram: @vynaa_valerie 
•• (github.com/VynaaValerie) 
*/

import fetch from "node-fetch";

let handler = async (m, { conn, command, text }) => {
    if (!text) throw 'aiimage\naiimage1\naiimage2\naiimage3\naiimage4\naiimage5\naiimage6\ndalle\nstablediffusion\n\nExample:highly detailed, intricate, 4k, 8k, sharp focus, detailed hair, detailed';

    // Inform the user that the request is being processed
    m.reply('Please wait, generating your image...');

    // Define the API endpoints
    const apiEndpoints = {
        aiimage: `https://widipe.com/ai/text2img?text=${encodeURIComponent(text)}`,
        aiimage1: `https://widipe.com/ai/text2img?text=${encodeURIComponent(text)}`,
        aiimage2: `https://widipe.com/ai/text2img?text=${encodeURIComponent(text)}`,
        aiimage3: `https://widipe.com/ai/text2img?text=${encodeURIComponent(text)}`,
        aiimage4: `https://widipe.com/ai/text2img?text=${encodeURIComponent(text)}`,
        aiimage5: `https://widipe.com/ai/text2img?text=${encodeURIComponent(text)}`,
        aiimage6: `https://widipe.com/ai/text2img?text=${encodeURIComponent(text)}`,
        dalle: `https://widipe.com/dalle?text=${encodeURIComponent(text)}`,
        stablediffusion: `https://widipe.com/stablediffusion?text=${encodeURIComponent(text)}`
    };

    // Select the API URL based on the command
    let apiUrl = apiEndpoints[command];

    try {
        // Fetch the image from the API
        let response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Error fetching image: ${response.statusText}`);

        // Get the image buffer
        let imageBuffer = await response.buffer();

        // Send the image back to the user
        await conn.sendFile(m.chat, imageBuffer, 'image.jpg', `Prompt: ${text}`, m);
    } catch (error) {
        // Handle any errors that occurred during the fetch
        m.reply(`Error: ${error.message}`);
    }
};

handler.help = ['aiimage', 'aiimage1', 'aiimage2', 'aiimage3', 'aiimage4', 'aiimage5', 'aiimage6', 'dalle', 'stablediffusion'];
handler.tags = ['ai'];
handler.command = /^(aiimage|aiimage1|aiimage2|aiimage3|aiimage4|aiimage5|aiimage6|dalle|stablediffusion)$/i;
handler.limit = true;

export default handler;
/*
 * Jangan Di Hapus!!
 * Buatan @PontaDev
 * Sumber: https://whatsapp.com/channel/0029VagslooA89MdSX0d1X1z
 */

import fetch from 'node-fetch';
import axios from "axios";

// Fungsi untuk mengirim prompt ke Sistem Yue
const sendToGemini = async (prompt) => {
    const apiKey = 'AIzaSyD5nO1Cy-H2EkSo6Svo-HQWRAH3TzaZB9s'; // Pastikan apikey ini valid
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
    
    const body = {
        contents: [
            {
                parts: [
                    { text: prompt }
                ]
            }
        ]
    };

    try {
        console.log("Sending request to Gemini API..."); // Debug log
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        console.log("Response status:", response.status); // Log status kode

        const data = await response.json();
        console.log("Response data:", data); // Log hasil response

        if (response.ok) {
            return data; 
        } else {
            throw new Error(data.error.message || 'Request failed');
        }
    } catch (error) {
        console.error('Error:', error.message);
        return null;
    }
};

// Handler untuk tomoe dengan Sistem Yue
let handler = async (m, { conn, isOwner, usedPrefix, command, text }) => {
    if (!text) {
        return m.reply("Contoh: .tomoe hai manis");
    }

    m.reply("tomoe sedang berfikir...");

    const prompt = "Nama kamu adalah tomoe, kamu adalah assisten virtual yang dikembangkan langsung dari google.";
    const combinedPrompt = `${prompt} ${text}`;

    try {
        console.log("Mengirim prompt ke Gemini:", combinedPrompt); // Log prompt yang dikirim

        const response = await sendToGemini(combinedPrompt);

        if (response) {
            const candidates = response.candidates;
            console.log("Candidates received:", candidates); // Log candidates yang diterima
            let message = candidates && candidates.length > 0
                ? candidates[0].content.parts[0].text
                : 'Tidak ada respons yang diterima dari model.';
            
            // Mengganti ** dengan * dan mengedit jawaban jika perlu
            message = message.replace(/\\/g, '*').replace(/#{2,}/g, '#');

            // Mengirim respons dari Gemini ke user
            await conn.sendMessage(m.chat, { text: message }, { quoted: m });
        } else {
            await conn.sendMessage(
                m.chat,
                { text: 'Gagal mendapatkan respons dari Sistem Yue.' },
                { quoted: m }
            );
        }
    } catch (error) {
        console.error(error);
        await conn.sendMessage(
            m.chat,
            { text: 'Terjadi kesalahan saat memproses permintaan Anda.' },
            { quoted: m }
        );
    }
};

handler.help = ['tomoe'];
handler.tags = ['ai'];
handler.command = /^(tomoe)$/i;
handler.limit = true;

export default handler;

import axios from "axios";
import crypto from "crypto";
import { FormData } from "formdata-node";

const detectText = async input_text => {
  try {
    const response = await fetch("https://api.zerogpt.com/api/detect/detectText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        origin: "https://www.zerogpt.com",
        "sec-fetch-site": "same-site",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
      },
      body: JSON.stringify({
        input_text: input_text
      })
    });
    return await response.json();
  } catch (error) {
    console.error("Error detecting text:", error);
    throw error;
  }
};

const analyzeText = async input => {
  const ip = `${Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join(".")}`;
  const formData = new FormData();
  formData.append("text", input);
  try {
    const { data } = await axios.post("https://app.illuminarty.ai/api/analysis/text", formData, {
      headers: {
        "Content-Type": `multipart/form-data; boundary=${formData.boundary}`,
        Cookie: `illuminarty_counter=${crypto.randomInt(1, 100)}`,
        "X-Forwarded-For": ip,
        Origin: "https://app.illuminarty.ai"
      }
    });
    return data;
  } catch {
    throw new Error("❌ *An error occurred:* Unable to process the request.");
  }
};

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const text = args.length ? args.join(" ") : m.quoted?.text || m.quoted?.caption || m.quoted?.description || null;
  if (!text) return m.reply(`Masukkan teks atau reply pesan dengan teks yang ingin diolah.\nContoh penggunaan:\n*${usedPrefix}${command} Hai, apa kabar?*`);

  try {
    let res;
    if (command === "ishuman") {
      const result = await detectText(text);
      const { isHuman, additional_feedback, originalParagraph, feedback, detected_language, textWords, aiWords, fakePercentage } = result.data;
      res = isHuman === 100 ? `🧑‍💻 *Teks ini terdeteksi dibuat oleh Manusia*\n\n*Umpan Balik:* ${feedback}\n*Kalimat Asli:* ${originalParagraph}\n*Bahasa Terdeteksi:* ${detected_language}\n*Jumlah Kata:* ${textWords}\n*Jumlah Kata AI:* ${aiWords}\n*Persentase Palsu:* ${Math.round(fakePercentage * 100) / 100}%` :
           isHuman === 0 ? `🤖 *Teks ini terdeteksi dibuat oleh Bot*\n\n*Kalimat Asli:* ${originalParagraph}\n*Bahasa Terdeteksi:* ${detected_language}\n*Jumlah Kata:* ${textWords}\n*Jumlah Kata AI:* ${aiWords}\n*Persentase Palsu:* ${Math.round(fakePercentage * 100) / 100}%` :
           `🔍 *Persentase manusia:* ${Math.round(isHuman * 100) / 100}%\n*Umpan Balik:* ${additional_feedback}\n*Kalimat Asli:* ${originalParagraph}\n*Bahasa Terdeteksi:* ${detected_language}\n*Jumlah Kata:* ${textWords}\n*Jumlah Kata AI:* ${aiWords}\n*Persentase Palsu:* ${Math.round(fakePercentage * 100) / 100}%`;
    } else if (command === "illuminarty") {
      const result = await analyzeText(text);
      const probability = result.data.probability;
      res = probability >= .5 ? `🤖 *Teks ini terdeteksi dibuat oleh AI (${Math.round(probability * 1e4) / 100}%)*` :
           `🧑‍💻 *Teks ini terdeteksi dibuat oleh Manusia (${Math.round(probability * 1e4) / 100}%)*`;
    }
    m.reply(res);
  } catch {
    // Menggunakan pesan balasan untuk menandai status error
    m.reply("❌ *Terjadi kesalahan:* Tidak dapat memproses permintaan.");
  }
};

handler.help = ["ishuman", "illuminarty"];
handler.tags = ["ai"];
handler.command = /^(ishuman|illuminarty)$/i;

export default handler;

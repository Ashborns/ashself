import axios from "axios";
import fetch from "node-fetch";
import { load } from "cheerio"; // Updated cheerio import
import fs from "fs";
import request from "request";
import { fileTypeFromBuffer } from 'file-type';

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
    let spas = "                ";
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';
    
    // Check if the quoted message is an image
    if (!/image/g.test(mime)) throw "Reply Gambar Aja";
    
    // Download the image
    let media = await q.download();
    
    // Upload to top4top and get the link
    let link = await top4top(media);
    let { result, status } = link;
    
    // Prepare the response message
    let caption = `*[ ${status.toUpperCase()} ]*

📮 *L I N K :*
${result}
📊 *S I Z E :* ${media.length} Byte
`;
    
    // Send the result back to the user
    conn.reply(m.chat, caption, m);
};

// Command configuration
handler.help = ["top4top"];
handler.tags = ["tools"];
handler.command = /^(top4top)$/i;
export default handler;

// Function to upload the file to top4top
async function top4top(baper) {
    return new Promise(async (resolve, reject) => {
        // Detect file type from the buffer
        const { ext } = await fileTypeFromBuffer(baper) || {};
        
        // Send a POST request to top4top
        request({
            url: "https://top4top.io/index.php",
            method: "POST",
            headers: {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                "accept-language": "en-US,en;q=0.9,id;q=0.8",
                "cache-control": "max-age=0",
                'content-type': 'multipart/form-data; boundary=----WebKitFormBoundaryAmIhdMyLOrbDawcA',
                'User-Agent': 'Mozilla/5.0 (BlackBerry; U; BlackBerry 9900; en) AppleWebKit/534.11+ (KHTML, like Gecko) Version/7.0.0.585 Mobile Safari/534.11+'
            }
        }, function (error, response, body) {
            if (error) {
                return resolve({
                    result: 'error'
                });
            }
            
            // Load the response body into cheerio
            const $ = load(body);
            
            // Extract the download link from the HTML
            let result = $('div.alert.alert-warning > ul > li > span').find('a').attr('href') || "gagal";
            
            if (result === "gagal") {
                resolve({
                    status: "error",
                    msg: "maybe file not allowed or try another file"
                });
            }
            
            // Resolve with the success result
            resolve({
                status: "sukses",
                result
            });
        });
        
        // Append the image and form data
        let form = req.form();
        form.append('file_1_', baper, {
            filename: `${Math.floor(Math.random() * 10000)}.${ext}`
        });
        form.append('file_1_', '');
        form.append('submitr', '[ رفع الملفات ]');
    });
}

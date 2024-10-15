import axios from 'axios';
import { load } from 'cheerio'; // Updated cheerio import

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply('Masukkan query pencarian!');

    // Function to scrape Google News
    const fetchGoogleNews = async (query) => {
        try {
            const response = await axios.get(`https://news.google.com/search`, {
                params: { q: query }
            });
            const html = response.data;
            const $ = load(html); // Use load instead of cheerio.load

            let results = [];
            $('article').each((index, element) => {
                const title = $(element).find('h3').text();
                let link = $(element).find('a').attr('href');
                const description = $(element).find('.xBbh9').text();

                if (link && link.startsWith('./')) {
                    link = `https://news.google.com${link.slice(1)}`;
                } else if (link && link.startsWith('/')) {
                    link = `https://news.google.com${link}`;
                }

                results.push({
                    title: title,
                    link: link,
                    description: description
                });
            });

            return results.slice(0, 10);
        } catch (error) {
            console.error(error);
            return [];
        }
    };

    // Fetch Google News results
    const results = await fetchGoogleNews(text);

    // Prepare the message with results
    if (results.length > 0) {
        let message = 'Hasil pencarian Google News:\n\n';
        results.forEach(result => {
            message += `*${result.title}*\n${result.description}\n${result.link}\n\n`;
        });
        conn.reply(m.chat, message, m);
    } else {
        conn.reply(m.chat, 'Tidak ada hasilnya.', m);
    }
};

export default handler;

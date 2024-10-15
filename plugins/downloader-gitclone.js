import fetch from 'node-fetch';

let regexRepo = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/([^\/:]+)(?:\/tree\/[^\/]+|\/blob\/[^\/]+)?(?:\/(.+))?/i;
let regexGist = /https:\/\/gist\.github\.com\/([^\/]+)\/([a-zA-Z0-9]+)/i;
let regexRawGitHub = /https:\/\/raw\.githubusercontent\.com\/([^\/]+)\/([^\/]+)\/([^\/]+)\/(.+)/i;

let handler = async (m, { conn, args }) => {
    if (!args[0]) throw 'Link GitHub nya mana?';

    let isRepo = regexRepo.test(args[0]);
    let isGist = regexGist.test(args[0]);
    let isRawGitHub = regexRawGitHub.test(args[0]);

    if (!isRepo && !isGist && !isRawGitHub) throw 'Link salah!';

    if (isRepo) {
        let [, user, repo] = args[0].match(regexRepo) || [];
        repo = repo.replace(/.git$/, '');
        let url = `https://api.github.com/repos/${user}/${repo}/zipball`;
        let filename = (await fetch(url, { method: 'HEAD' })).headers.get('content-disposition').match(/attachment; filename=(.*)/)[1];

        m.reply(`*Mohon tunggu, sedang mengirim repository..*`);
        await conn.sendMessage(m.chat, {
            document: { url: url },
            fileName: filename,
            mimetype: "application/zip",
            caption: `*Result From*: ${args}`
        }, { quoted: m });

    } else if (isGist) {
        let [, user, gistId] = args[0].match(regexGist) || [];
        let url = `https://gist.github.com/${user}/${gistId}/download`;

        m.reply(`*Mohon tunggu, sedang mengirim Gist..*`);
        await conn.sendMessage(m.chat, {
            document: { url: url },
            fileName: `${gistId}.zip`,
            mimetype: "application/zip",
            caption: `*Result From*: ${args}`
        }, { quoted: m });

    } else if (isRawGitHub) {
        let [, user, repo, branch, filepath] = args[0].match(regexRawGitHub) || [];
        let url = `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${filepath}`;
        let filename = filepath.split('/').pop();

        m.reply(`*Mohon tunggu, sedang mengirim file dari RawGitHub..*`);
        await conn.sendMessage(m.chat, {
            document: { url: url },
            fileName: filename,
            mimetype: "application/octet-stream",
            caption: `*Result From*: ${args}`
        }, { quoted: m });
    }
};

handler.help = ['gitclone <url>'];
handler.tags = ['downloader'];
handler.command = /gitclone/i;
handler.limit = true;

export default handler;

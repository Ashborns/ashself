import { readdirSync, rmSync, writeFileSync } from 'fs';

let handler = async (m, { conn, text }) => {
  const dir = './tmp';
  const files = readdirSync(dir);

  // Menghapus semua file kecuali satu
  if (files.length > 1) {
    files.forEach((f, index) => {
      if (index !== 0) { // Menyisakan satu file
        rmSync(`${dir}/${f}`);
      }
    });
  }

  // Buat file dummy jika folder kosong
  if (files.length === 0) {
    writeFileSync(`${dir}/dummy.txt`, 'This is a dummy file.');
  }

  let pesan = `The \`\`\`tmp folder\`\`\` has been cleaned, and one file remains.`;
  await m.reply(pesan);
};

handler.help = ['cleartmp'];
handler.tags = ['owner'];
handler.owner = false;
handler.command = /^(c(lear)?tmp)$/i;

export default handler;

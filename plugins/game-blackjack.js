import { setTimeout, clearTimeout } from 'node:timers'; // Import timers for handling timeouts

let conn = {}; // Placeholder for `conn`, adjust according to your implementation

export async function handler(m, { conn, usedPrefix, command, text }) {
  conn.bj = conn.bj ? conn.bj : {};
  if (m.sender in conn.bj) return m.reply("Kamu masih dalam game, tunggu sampai selesai!!");

  try {
    const cards = [
      'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'
    ];

    const playerCards = [];
    const computerCards = [];

    const calculateTotal = (cardArray) => {
      let total = 0;
      let hasAce = false;

      for (const card of cardArray) {
        if (card === 'A') {
          total += 11;
          hasAce = true;
        } else if (card === 'K' || card === 'Q' || card === 'J') {
          total += 10;
        } else {
          total += parseInt(card);
        }
      }

      if (hasAce && total > 21) {
        total -= 10;
      }

      return total;
    };

    const pickCard = () => {
      const index = Math.floor(Math.random() * cards.length);
      return cards[index];
    };

    if (!(m.sender in conn.bj)) {
      const bet = parseInt(text);
      if (isNaN(bet) || bet <= 0) {
        return m.reply(`Masukkan Jumlah!\n\nContoh: *${usedPrefix + command} 1000*`);
      }
      if (global.db.data.users[m.sender].money < bet) {
        return m.reply('Uang kamu tidak mencukupi');
      }

      playerCards.push(pickCard(), pickCard());
      computerCards.push(pickCard());

      let playerTotal = calculateTotal(playerCards);
      let computerTotal = calculateTotal(computerCards);

      if (playerTotal === 21 && computerTotal !== 21) {
        sendResultMessage(`*Kamu mendapatkan Blackjack! Kamu menang!*\n*+${bet} Money*`, playerTotal, computerTotal);
        global.db.data.users[m.sender].money += bet;
        delete conn.bj[m.sender];
      } else if (playerTotal === 21 && computerTotal === 21) {
        sendResultMessage('*Hasilnya SERI! Keduanya mendapatkan Blackjack!*', playerTotal, computerTotal);
        delete conn.bj[m.sender];
      } else {
        conn.bj[m.sender] = {
          playerCards,
          computerCards,
          playerTotal,
          computerTotal,
          bet,
          timeout: setTimeout(() => {
            m.reply('Waktu habis');
            delete conn.bj[m.sender];
          }, 60000)
        };

        const message = `*• B L A C K J A C K*\n\n` +
                        `╭── •\n` +
                        `│ ◦ *Kartu Kamu:* ${playerCards.join(', ')}\n` +
                        `│ ◦ *Total Kamu:* ${playerTotal}\n` +
                        `├─ •\n` +
                        `│ ◦ *Kartu Komputer:* ${computerCards[0]}, ?\n` +
                        `│ ◦ *Taruhan:* ${bet}\n` +
                        `╰── •\n\n` +
                        `Ketik *hit* untuk mengambil kartu tambahan.\n` +
                        `Ketik *stand* untuk mengakhiri giliran.`;
        
        conn.reply(m.chat, message, m, {
          contextInfo: {
            externalAdReply: {
              title: 'C A S I N O',
              body: "",
              thumbnailUrl: "https://telegra.ph/file/1703cff0a758d0ef8f84f.png",
              sourceUrl: sig,
              mediaType: 1,
              renderLargerThumbnail: true
            }
          }
        });
      }
    }
  } catch (e) {
    console.error(e);
    conn.reply(m.chat, 'Terjadi kesalahan saat menjalankan game Blackjack.', m);
    
    if (m.sender in conn.bj) {
      const { timeout } = conn.bj[m.sender];
      clearTimeout(timeout);
      delete conn.bj[m.sender];
    }
  }
}

handler.before = async (m, { conn }) => {
  conn.bj = conn.bj ? conn.bj : {};
  if (!(m.sender in conn.bj)) return;
  if (m.isBaileys) return;

  const { timeout } = conn.bj[m.sender];
  const txt = (m.msg.selectedDisplayText ? m.msg.selectedDisplayText : m.text ? m.text : '').toLowerCase();
  if (txt !== "stand" && txt !== "hit") return;

  const cards = [
    'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'
  ];

  const calculateTotal = (cardArray) => {
    let total = 0;
    let hasAce = false;

    for (const card of cardArray) {
      if (card === 'A') {
        total += 11;
        hasAce = true;
      } else if (card === 'K' || card === 'Q' || card === 'J') {
        total += 10;
      } else {
        total += parseInt(card);
      }
    }

    if (hasAce && total > 21) {
      total -= 10;
    }

    return total;
  };

  const pickCard = () => {
    const index = Math.floor(Math.random() * cards.length);
    return cards[index];
  };

  const bjData = conn.bj[m.sender];
  let playerCards = bjData.playerCards;
  let computerCards = bjData.computerCards;
  let playerTotal = calculateTotal(playerCards);
  let computerTotal = bjData.computerTotal;
  const bet = bjData.bet;

  const sendResultMessage = (result, playerTotal, computerTotal) => {
    const message = `*• B L A C K J A C K - R E S U L T*\n\n` +
                    `╭── •\n` +
                    `│ ◦ *Kartu Kamu:* ${playerCards.join(', ')}\n` +
                    `│ ◦ *Total Kamu:* ${playerTotal}\n` +
                    `├─ •\n` +
                    `│ ◦ *Kartu Komputer:* ${computerCards.join(', ')}\n` +
                    `│ ◦ *Total Komputer:* ${computerTotal}\n` +
                    `╰── •\n\n` +
                    `${result}`;

    conn.reply(m.chat, message, m, {
      contextInfo: {
        externalAdReply: {
          title: 'C A S I N O',
          body: "",
          thumbnailUrl: "https://telegra.ph/file/1703cff0a758d0ef8f84f.png",
          sourceUrl: sig,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    });
  };

  try {
    if (/^hit?$/i.test(txt)) {
      const newCard = pickCard();
      playerCards.push(newCard);
      playerTotal = calculateTotal(playerCards);

      if (playerTotal > 21) {
        sendResultMessage(`*Kamu kalah! Total kartu melebihi 21.*\n*-${bet} Money*`, playerTotal, computerTotal);
        global.db.data.users[m.sender].money -= bet;
        clearTimeout(conn.bj[m.sender].timeout);
        delete conn.bj[m.sender];
      } else if (playerTotal === 21) {
        sendResultMessage(`*Kamu menang!*\n*+${bet} Money*`, playerTotal, computerTotal);
        global.db.data.users[m.sender].money += bet;
        clearTimeout(timeout);
        delete conn.bj[m.sender];
      } else {
        const message = `*• B L A C K J A C K*\n\n` +
                        `╭── •\n` +
                        `│ ◦ *Kartu Kamu:* ${playerCards.join(', ')}\n` +
                        `│ ◦ *Total Kamu:* ${playerTotal}\n` +
                        `├─ •\n` +
                        `│ ◦ *Kartu Komputer:* ${computerCards[0]}, ?\n` +
                        `│ ◦ *Taruhan:* ${bet}\n` +
                        `╰── •\n\n` +
                        `Ketik *hit* untuk mengambil kartu tambahan.\n` +
                        `Ketik *stand* untuk mengakhiri giliran.`;

        conn.reply(m.chat, message, m, {
          contextInfo: {
            externalAdReply: {
              title: 'C A S I N O',
              body: "",
              thumbnailUrl: "https://telegra.ph/file/1703cff0a758d0ef8f84f.png",
              sourceUrl: sig,
              mediaType: 1,
              renderLargerThumbnail: true
            }
          }
        });
      }

    } else if (/^stand?$/i.test(txt)) {
      while (computerTotal < 18) {
        const newCard = pickCard();
        computerCards.push(newCard);
        computerTotal = calculateTotal(computerCards);
      }

      if (computerTotal > 21) {
        sendResultMessage(`*Kamu menang! Total kartu Komputer melebihi 21.*\n*+${bet} Money*`, playerTotal, computerTotal);
        global.db.data.users[m.sender].money += bet;
      } else if (playerTotal > computerTotal) {
        sendResultMessage(`*Kamu menang!*\n*+${bet} Money*`, playerTotal, computerTotal);
        global.db.data.users[m.sender].money += bet;
      } else if (playerTotal < computerTotal) {
        sendResultMessage(`*Kamu kalah!*\n*-${bet} Money*`, playerTotal, computerTotal);
        global.db.data.users[m.sender].money -= bet;
      } else {
        sendResultMessage('*Hasilnya SERI!*', playerTotal, computerTotal);
      }
      clearTimeout(timeout);
      delete conn.bj[m.sender];
    }
  } catch (e) {
    console.error(e);
    conn.reply(m.chat, 'Terjadi kesalahan saat menjalankan game Blackjack.', m);
    clearTimeout(timeout);
    delete conn.bj[m.sender];
  }
}

handler.command = ['blackjack', 'bj'];
handler.help = ['blackjack', 'bj'];
handler.tags = ['game'];
handler.register = true;
handler.limit = false;

export default handler;

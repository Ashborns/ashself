import axios from 'axios';
const {
  generateWAMessageContent,
  generateWAMessageFromContent,
  proto
} = (await import("@adiwajshing/baileys")).default;

let handler = async (messageContext, {
  conn: connection,
  text: searchTerm,
  usedPrefix: prefix,
  command
}) => {
  if (!searchTerm) {
    return messageContext.reply("• *Example:* " + (prefix + command) + " kucing");
  }

  await messageContext.reply("*_`PROCESS`_*");

  async function generateImageMessage(imageUrl) {
    const { imageMessage } = await generateWAMessageContent({
      image: { url: imageUrl }
    }, {
      upload: connection.waUploadToServer
    });
    return imageMessage;
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  let imageUrls = [];
  let { data } = await axios.get("https://www.pinterest.com/resource/BaseSearchResource/get/?source_url=%2Fsearch%2Fpins%2F%3Fq%3D" + searchTerm + "&data=%7B%22options%22%3A%7B%22isPrefetch%22%3Afalse%2C%22query%22%3A%22" + searchTerm + "%22%2C%22scope%22%3A%22pins%22%2C%22no_fetch_context_on_resource%22%3Afalse%7D%2C%22context%22%3A%7B%7D%7D&_=1619980301559");

  let pinterestResults = data.resource_response.data.results.map(result => result.images.orig.url);
  shuffleArray(pinterestResults);

  let selectedImages = pinterestResults.splice(0, 5);
  let imageCounter = 1;

  for (let imageUrl of selectedImages) {
    imageUrls.push({
      body: proto.Message.InteractiveMessage.Body.fromObject({
        text: "Image ke - " + imageCounter++
      }),
      footer: proto.Message.InteractiveMessage.Footer.fromObject({
        text: "乂 P I N T E R E S T"
      }),
      header: proto.Message.InteractiveMessage.Header.fromObject({
        title: "Hasil.",
        hasMediaAttachment: true,
        imageMessage: await generateImageMessage(imageUrl)
      }),
      nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
        buttons: [{
          name: "cta_url",
          buttonParamsJson: `{"display_text":"Source","url":"https://www.pinterest.com/search/pins/?rs=typed&q=${searchTerm}","merchant_url":"https://www.pinterest.com/search/pins/?rs=typed&q=${searchTerm}"}`
        }]
      })
    });
  }

  const message = generateWAMessageFromContent(messageContext.chat, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {
          deviceListMetadata: {},
          deviceListMetadataVersion: 2
        },
        interactiveMessage: proto.Message.InteractiveMessage.fromObject({
          body: proto.Message.InteractiveMessage.Body.create({
            text: "selesai..."
          }),
          footer: proto.Message.InteractiveMessage.Footer.create({
            text: "乂 P I N T E R E S T"
          }),
          header: proto.Message.InteractiveMessage.Header.create({
            hasMediaAttachment: false
          }),
          carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
            cards: [...imageUrls]
          })
        })
      }
    }
  }, {});

  await connection.relayMessage(messageContext.chat, message.message, {
    messageId: message.key.id
  });
};
handler.help = ["pinterest", "pintges"];
handler.tags = ["downloader"];
handler.command = /^(pin|pinterest|pintges)$/i;
export default handler;

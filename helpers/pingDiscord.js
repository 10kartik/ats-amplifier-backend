const axios = require("axios");

// Your webhook URL
const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

async function sendMessageToDiscord(url, text, ClientInfo) {
  const message = {
    content:
      "**====START================================**" +
      "\n" +
      `**Time:** ${new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      })}` +
      "\n" +
      `**PDF:** ${url}` +
      "\n" +
      `**Keywords:** ${text}` +
      "\n" +
      `**Client Info:** \n ||${JSON.stringify(ClientInfo)} ||` +
      "\n" +
      "**====END====================================**",
  };

  try {
    await axios.post(webhookUrl, message);
    console.log("Message sent to Discord successfully");
  } catch (error) {
    console.error("Error sending message to Discord:", error.message);
  }
}

module.exports = sendMessageToDiscord;

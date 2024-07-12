const axios = require("axios");

const webhookUrl = process.env.webhook_url;

async function sendMessageToSlack(url, text, ClientInfo) {
  const payload = {
    text:
      `Time: ${new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      })}` +
      "\n" +
      `PDF: ${url}` +
      "\n" +
      `Keywords: ${text}` +
      "\n\n```" +
      `Client Info: ${JSON.stringify(ClientInfo)}` +
      "```",
  };

  await axios
    .post(webhookUrl, payload)
    .then((response) => {
      console.log("Message sent to Slack successfully");
    })
    .catch((error) => {
      console.error("Error sending message to Slack:", error);
    });
}

module.exports = sendMessageToSlack;

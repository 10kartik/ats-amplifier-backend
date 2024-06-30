const axios = require("axios");

const webhookUrl = process.env.webhook_url;

async function sendMessageToSlack(text) {
  const payload = {
    text:
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }) +
      "\n" +
      text,
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

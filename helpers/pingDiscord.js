// Import the Discord.js library
const { Client, GatewayIntentBits } = require("discord.js");

// Create a new Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Your bot token
const token = process.env.DISCORD_BOT_TOKEN;

// The ID of the channel you want to send a message to
const channelId = process.env.DISCORD_ATS_CHANNEL_ID;

// Log in to the bot
client.login(token);

// Once the bot is ready
client.once("ready", () => {
  console.log("Discord bot is ready");
});

function sendMessageToDiscord(url, text, ClientInfo) {
  const channel = client.channels.cache.get(channelId);

  const message =
    `Time: ${new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    })}` +
    "\n" +
    `PDF: ${url}` +
    "\n" +
    `Keywords: ${text}` +
    "\n\n``` " +
    `Client Info: ${JSON.stringify(ClientInfo)}` +
    " ```";

  if (channel) {
    channel.send(message);
  } else {
    console.log("Channel not found");
  }
}

module.exports = sendMessageToDiscord;

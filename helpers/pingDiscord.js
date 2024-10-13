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

function waitForClientReady() {
  return new Promise((resolve) => {
    if (client.isReady()) {
      resolve();
    } else {
      client.once("ready", resolve);
    }
  });
}

async function sendMessageToDiscord(url, text, ClientInfo) {
  await waitForClientReady();

  const channel = client.channels.cache.get(channelId);

  const message =
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
    "**====END====================================**";

  if (channel) {
    channel.send(message);
    console.log("Message sent to Discord successfully");
  } else {
    console.log("Channel not found");
  }
}

module.exports = sendMessageToDiscord;

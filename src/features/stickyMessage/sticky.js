const { Client, GatewayIntentBits } = require("discord.js");
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

const stickyMessageContent = "This is a sticky message!";
const stickyChannelId = "YOUR_CHANNEL_ID"; // Replace with your channel ID
let stickyMessageId = null;

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async (message) => {
  // Ignore bot messages and messages outside the specified channel
  if (message.author.bot || message.channel.id !== stickyChannelId) return;

  try {
    const channel = message.channel;

    // Delete the old sticky message if it exists
    if (stickyMessageId) {
      const oldMessage = await channel.messages
        .fetch(stickyMessageId)
        .catch(() => null);
      if (oldMessage) await oldMessage.delete();
    }

    // Send the new sticky message
    const newStickyMessage = await channel.send(stickyMessageContent);
    stickyMessageId = newStickyMessage.id; // Update the sticky message ID
  } catch (error) {
    console.error("Error managing the sticky message:", error);
  }
});

client.login("YOUR_BOT_TOKEN");

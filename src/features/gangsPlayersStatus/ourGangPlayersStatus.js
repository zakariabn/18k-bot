import { EmbedBuilder } from "discord.js";
import client from "../../../bot.js";
import { FetchingServerData } from "../../Component/functionsComponent.js";
import { rosterDB } from "../../Component/db.js";
import moment from "moment-timezone";

// Time tracker for online players
const onlineTimeTracker = {};
let cachedMembers = [];
let lastFetched = Date.now();
const onlinePlayersSet = new Set();

// Utility function to format time (in seconds) to "Hh Mm Ss"
function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}

// Fetch members from the database, caching for efficiency
async function getMembers() {
  if (Date.now() - lastFetched > 60000) {
    // Refresh cache every minute
    await rosterDB.read();
    cachedMembers = rosterDB.data.members || [];
    lastFetched = Date.now();
  }
  return cachedMembers;
}

// Main function to get gang player status
async function GangPlayerStatus() {
  const serverData = await FetchingServerData();
  const serverPlayers = serverData?.Data?.players || [];
  onlinePlayersSet.clear();
  serverPlayers.forEach((player) => onlinePlayersSet.add(player.name));

  const ourOnlinePlayers = [];
  const ourOfflinePlayers = [];
  const playerStatusWithTime = [];

  try {
    const members = await getMembers();

    members.forEach((member) => {
      const { steam_name: steamName, ign } = member;
      const isOnline = onlinePlayersSet.has(steamName);

      if (isOnline) {
        ourOnlinePlayers.push(ign);

        // Track or increment the online time
        if (!onlineTimeTracker[ign]) onlineTimeTracker[ign] = 0;
        onlineTimeTracker[ign] += 10; // Increment by 10 seconds

        playerStatusWithTime.push(
          `${ign} (${formatTime(onlineTimeTracker[ign])})`
        );
      } else {
        ourOfflinePlayers.push(ign);
        if (onlineTimeTracker[ign]) delete onlineTimeTracker[ign]; // Reset if offline
      }
    });
  } catch (error) {
    console.error("Error in GangPlayerStatus:", error);
  }

  return { ourOnlinePlayers, ourOfflinePlayers, playerStatusWithTime };
}

// Function to send and update the embed
export default async function SendGangPlayerStatus() {
  const channel = client.channels.cache.get("1306282347569873087");

  let embedMessage = await channel.messages
    .fetch({ limit: 1 })
    .then((messages) =>
      messages.find((msg) => msg.author.id === client.user.id)
    )
    .catch(console.error);

  if (!embedMessage) {
    embedMessage = await channel
      .send({ content: "Loading player status..." })
      .catch(console.error);
  }

  let lastStatus = { online: [], offline: [] };

  setInterval(async () => {
    const { ourOnlinePlayers, ourOfflinePlayers, playerStatusWithTime } =
      await GangPlayerStatus();

    if (
      JSON.stringify(lastStatus) !==
      JSON.stringify({ online: ourOnlinePlayers, offline: ourOfflinePlayers })
    ) {
      lastStatus = { online: ourOnlinePlayers, offline: ourOfflinePlayers };

      const embed = new EmbedBuilder()
        .setColor("#778899")
        .setTitle("***THE 18K SIN's*** **Player Status**")
        .setDescription("Status updates every 10 seconds.")
        .addFields(
          {
            name: "**💚 Online Players**",
            value: `\`\`\`➢ ${
              playerStatusWithTime.join("\n➢ ") || "None"
            } \`\`\``,
            inline: false,
          },
          {
            name: "**❤️ Offline Players**",
            value: `\`\`\`➢ ${ourOfflinePlayers.join("\n➢ ") || "None"} \`\`\``,
            inline: false,
          }
        )
        .setImage("https://i.ibb.co/Zd80Pwg/18k-tarf-bg-logo-3.png")
        .setTimestamp();

      await embedMessage.edit({ embeds: [embed] }).catch(console.error);
    }
  }, 10000); // Updates every 10 seconds
}

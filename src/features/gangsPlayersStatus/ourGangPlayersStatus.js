import { EmbedBuilder } from "discord.js";
import client from "../../../bot.js";
import { FetchingServerData } from "../../Component/functionsComponent.js";
import { rosterDB } from "../../Component/db.js";
import moment from "moment-timezone";

const onlineTimeTracker = {}; // Track online time in memory
let db = rosterDB; // Load the database once

// Helper to load database
async function loadDatabase() {
  await db.read();
  return db.data.members;
}

// Helper to save database
async function saveDatabase() {
  await db.write();
}

// Convert total seconds to "Hh Mm Ss" format and return as a string
function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
}

// Update online time for players
function updateOnlineTime(onlinePlayers) {
  const now = moment();
  onlinePlayers.forEach((playerName) => {
    if (!onlineTimeTracker[playerName]) {
      onlineTimeTracker[playerName] = { startTime: now, total: 0 };
    } else {
      const player = onlineTimeTracker[playerName];
      player.total += now.diff(player.startTime, "seconds");
      player.startTime = now; // Reset start time
    }
  });
}

// Get player status from the database and server data
async function getPlayerStatus() {
  const serverData = await FetchingServerData();
  const serverPlayers = serverData?.Data?.players || [];
  const members = await loadDatabase();

  const onlinePlayers = [];
  const offlinePlayers = [];
  const memberSteamNames = new Set(members.map((m) => m.steam_name));

  serverPlayers.forEach((player) => {
    if (memberSteamNames.has(player.name)) {
      onlinePlayers.push(player.name); // Collect Steam names of online players
    }
  });

  members.forEach((member) => {
    if (!onlinePlayers.includes(member.steam_name)) {
      offlinePlayers.push(member.steam_name);
    }
  });

  return { onlinePlayers, offlinePlayers, members };
}

// Save time to the database as "Hh Mm Ss"
async function saveOnlineTimeToDb(onlinePlayers) {
  onlinePlayers.forEach((steamName) => {
    const member = db.data.members.find((m) => m.steam_name === steamName);
    if (member) {
      const totalSeconds = onlineTimeTracker[steamName]?.total || 0;
      const formattedTime = formatTime(totalSeconds);
      member.online_time = formattedTime; // Save time as "Hh Mm Ss"
    }
  });
  await saveDatabase();
}

// Send or update the embed message
async function updateEmbed(
  channel,
  embedMessage,
  onlinePlayers,
  offlinePlayers,
  members
) {
  // Map online players with their formatted total online time and display their IGN
  const onlineStatuses = onlinePlayers.map((steamName) => {
    const member = members.find((m) => m.steam_name === steamName);
    const ign = member ? member.ign : steamName; // Get IGN from database or use Steam name if not found
    const totalSeconds = onlineTimeTracker[steamName]?.total || 0;
    const formattedTime = formatTime(totalSeconds);
    return `${ign} - ${formattedTime}`; // Display IGN with total online time
  });

  // Map offline players with their IGN
  const offlineStatuses = offlinePlayers.map((steamName) => {
    const member = members.find((m) => m.steam_name === steamName);
    const ign = member ? member.ign : steamName; // Get IGN from database or use Steam name if not found
    return ign; // Only display IGN for offline players
  });

  const embed = new EmbedBuilder()
    .setColor("#778899")
    .setTitle("***THE 18K SIN's*** **Player Status**")
    .setDescription("Status updates every 10 seconds.")
    .addFields(
      {
        name: "**💚 Online Players**",
        value: `\`\`\`➢ ${onlineStatuses.join("\n➢ ") || "None"} \`\`\``,
        inline: false,
      },
      {
        name: "**❤️ Offline Players**",
        value: `\`\`\`➢ ${offlineStatuses.join("\n➢ ") || "None"} \`\`\``,
        inline: false,
      }
    )
    .setImage("https://i.ibb.co.com/Zd80Pwg/18k-tarf-bg-logo-3.png")
    .setTimestamp();

  await embedMessage.edit({ embeds: [embed] }).catch(console.error);
}

// Main function to send the player status
export default async function SendGangPlayerStatus() {
  const channel = client.channels.cache.get("1306282347569873087");

  // Fetch the last sent message by the bot
  let embedMessage = await channel.messages
    .fetch({ limit: 1 })
    .then((messages) =>
      messages.find((msg) => msg.author.id === client.user.id)
    )
    .catch(console.error);

  // If no message exists, send a new one
  if (!embedMessage) {
    embedMessage = await channel
      .send({ content: "Loading player status..." })
      .catch(console.error);
  }

  // Periodic updates
  setInterval(async () => {
    const { onlinePlayers, offlinePlayers, members } = await getPlayerStatus();

    // Update online time
    updateOnlineTime(onlinePlayers);

    // Save online time to the database periodically
    await saveOnlineTimeToDb(onlinePlayers);

    // Update the embed message
    await updateEmbed(
      channel,
      embedMessage,
      onlinePlayers,
      offlinePlayers,
      members
    );
  }, 10000);
}

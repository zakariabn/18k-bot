import { EmbedBuilder } from "discord.js";
import client from "../../../bot.js";
import { FetchingServerData } from "../../Component/functionsComponent.js";
import { rosterDB, playersTimeDB } from "../../Component/db.js";
import moment from "moment-timezone";

const CHANNEL_ID = "1306282347569873087"; // Replace with your channel ID
const ASH_COLOR = "#778899"; // Ash-grey color
const LOGO_URL = "https://i.ibb.co.com/Zd80Pwg/18k-tarf-bg-logo-3.png"; // Replace with your logo URL
const UPDATE_INTERVAL = 10000; // 10 seconds

// Load timers and message ID from the database
async function loadTimers() {
  const db = playersTimeDB;
  await db.read();
  if (!db.data.playerTimers) {
    db.data.playerTimers = {}; // Initialize if it doesn't exist
  }
  if (!db.data.messageId) {
    db.data.messageId = "1306907750520979477"; // Initialize if it doesn't exist
  }
  return db.data;
}

// Save timers and message ID to the database
async function saveTimers(data) {
  const db = playersTimeDB;
  db.data = data;
  await db.write();
}

// Helper function to format time in HH:mm:ss
function formatTime(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours}h ${minutes}m ${secs}s`;
}

// Create an embed message with player status
async function createEmbed(ourOnlinePlayers, ourOfflinePlayers) {
  return new EmbedBuilder()
    .setColor(ASH_COLOR)
    .setTitle("***THE 18K SIN's*** **Player Status**")
    .setDescription("Status updates every 10 seconds.")
    .addFields(
      { name: "\u200B", value: "\u200B", inline: false }, // Blank field for spacing
      {
        name: "**💚 Online Players**",
        value:
          ourOnlinePlayers.length > 0
            ? `\`\`\`${ourOnlinePlayers
                .map((p) => `➢ ${p.ign} - ${p.onlineTime}`)
                .join("\n")} \`\`\``
            : "```None```",
        inline: false,
      },
      {
        name: "**❤️ Offline Players**",
        value:
          ourOfflinePlayers.length > 0
            ? `\`\`\`${ourOfflinePlayers
                .map((p) => `➢ ${p.ign}`)
                .join("\n")} \`\`\``
            : "```None```",
        inline: false,
      }
    )
    .setImage(LOGO_URL)
    .setTimestamp();
}

// Check player status and update timers
async function GangPlayerStatus() {
  const serverData = await FetchingServerData();
  const serverPlayers = serverData?.Data?.players;

  const ourOnlinePlayers = [];
  const ourOfflinePlayers = [];

  try {
    if (!serverPlayers || !Array.isArray(serverPlayers)) {
      console.log("serverPlayers is undefined or not an array.");
      return { ourOnlinePlayers, ourOfflinePlayers };
    }

    // Load roster database
    const roster = rosterDB;
    await roster.read();

    // Get members from the database
    const members = roster.data?.members || [];
    const memberMap = new Map(
      members.map((member) => [member.steam_name, member])
    );

    // Load current timers and message ID
    const { playerTimers } = await loadTimers();

    // Check online status and update timers
    serverPlayers.forEach((player) => {
      const member = memberMap.get(player.name);
      if (member) {
        // If player is online and not already being tracked, start the timer
        if (!playerTimers[player.name]) {
          playerTimers[player.name] = {
            startTime: new Date().toISOString(),
            elapsedTime: 0,
          };
        }

        // Calculate elapsed time
        const timer = playerTimers[player.name];
        const startTime = new Date(timer.startTime);
        const elapsedTime = new Date() - startTime + timer.elapsedTime;

        ourOnlinePlayers.push({
          ign: member.ign,
          onlineTime: formatTime(elapsedTime),
        });
      }
    });

    // Check offline players
    members.forEach((member) => {
      const isOnline = serverPlayers.some((p) => p.name === member.steam_name);
      if (!isOnline) {
        // If player is offline and was being tracked, stop the timer
        if (playerTimers[member.steam_name]) {
          const timer = playerTimers[member.steam_name];
          const startTime = new Date(timer.startTime);
          timer.elapsedTime += new Date() - startTime;
          delete playerTimers[member.steam_name]; // Remove from active timers
        }

        ourOfflinePlayers.push({
          ign: member.ign,
          onlineTime: formatTime(
            playerTimers[member.steam_name]?.elapsedTime || 0
          ),
        });
      }
    });

    // Save updated timers to the database
    await saveTimers({ playerTimers, messageId: playersTimeDB.data.messageId });
  } catch (error) {
    console.error("Error in GangPlayerStatus:", error);
  }

  return { ourOnlinePlayers, ourOfflinePlayers };
}

// Main function to send and update player status
export default async function SendGangPlayerStatus() {
  const channel = client.channels.cache.get(CHANNEL_ID);

  if (!channel) {
    console.error("Channel not found!");
    return;
  }

  // Load timers and message ID
  const { playerTimers, messageId } = await loadTimers();

  let embedMessage;
  if (messageId) {
    // Fetch the existing message
    embedMessage = await channel.messages.fetch(messageId).catch(console.error);
  }

  if (!embedMessage) {
    // Send a new message if the existing one is not found
    embedMessage = await channel
      .send({ content: "Loading player status..." })
      .catch(console.error);
    // Save the new message ID
    await saveTimers({ playerTimers, messageId: embedMessage.id });
  }

  // Update the embed message every 10 seconds
  setInterval(async () => {
    try {
      const { ourOnlinePlayers, ourOfflinePlayers } = await GangPlayerStatus();
      const embed = await createEmbed(ourOnlinePlayers, ourOfflinePlayers);

      await embedMessage.edit({ embeds: [embed] }).catch(console.error);
    } catch (error) {
      console.error("Error updating player status:", error);
    }
  }, UPDATE_INTERVAL);
}

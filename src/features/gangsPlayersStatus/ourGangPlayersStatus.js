import { EmbedBuilder } from "discord.js";
import client from "../../../bot.js";
import { FetchingServerData } from "../../Component/functionsComponent.js";
import { rosterDB } from "../../Component/db.js";

const CHANNEL_ID = "1306282347569873087"; // Replace with your status channel ID
const SESSION_LOG_CHANNEL_ID = "1332758156127899718"; // Replace with your session log channel ID
const ASH_COLOR = "#778899"; // Ash-grey color
const LOGO_URL = "https://i.ibb.co.com/Zd80Pwg/18k-tarf-bg-logo-3.png"; // Replace with your logo URL
const UPDATE_INTERVAL = 10000; // 10 seconds

// Helper function to format time in HH:mm:ss
function formatTime(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(secs).padStart(2, "0")}`;
}

// Convert HH:mm:ss to milliseconds
function parseTimeToMs(timeString) {
  const [hours, minutes, seconds] = timeString.split(":").map(Number);
  return (hours * 3600 + minutes * 60 + seconds) * 1000;
}

// Create an embed message with player status
async function createEmbed(ourOnlinePlayers, ourOfflinePlayers) {
  return new EmbedBuilder()
    .setColor(ASH_COLOR)
    .setTitle("***THE 18K SIN's*** **Player Status**")
    .setDescription("Status updates every 10 seconds.")
    .addFields(
      { name: "\u200B", value: "\u200B", inline: false },
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

// Send session details to the log channel
async function sendSessionLog(member, sessionDuration, totalOnlineTime) {
  const logChannel = client.channels.cache.get(SESSION_LOG_CHANNEL_ID);
  if (!logChannel) {
    console.error("Session log channel not found!");
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(ASH_COLOR)
    .setDescription(
      `**${member.ign}** is offline.\n\n**Last Session Duration:** ${sessionDuration}\n**Total Online Time:** ${totalOnlineTime}`
    );

  await logChannel.send({ embeds: [embed] }).catch(console.error);
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

    // Check online status and update timers
    serverPlayers.forEach((player) => {
      const member = memberMap.get(player.name);
      if (member) {
        if (!member.playerTimer) {
          member.playerTimer = {
            startTime: new Date().toISOString(),
            elapsedTime: 0,
          };
        }

        const timer = member.playerTimer;
        const startTime = new Date(timer.startTime);
        const elapsedTime = new Date() - startTime + timer.elapsedTime;

        ourOnlinePlayers.push({
          ign: member.ign,
          onlineTime: formatTime(elapsedTime),
        });
      }
    });

    // Check offline players
    members.forEach(async (member) => {
      const isOnline = serverPlayers.some((p) => p.name === member.steam_name);
      if (!isOnline) {
        if (member.playerTimer) {
          const timer = member.playerTimer;
          const startTime = new Date(timer.startTime);
          const elapsedTime = new Date() - startTime + timer.elapsedTime;

          const totalOnlineTimeMs = parseTimeToMs(
            member.online_time || "00:00:00"
          );
          const newTotalOnlineTimeMs = totalOnlineTimeMs + elapsedTime;

          member.online_time = formatTime(newTotalOnlineTimeMs);

          const sessionDuration = formatTime(elapsedTime);
          const totalOnlineTime = member.online_time;

          // await sendSessionLog(member, sessionDuration, totalOnlineTime);

          member.playerTimer = null;
        }

        ourOfflinePlayers.push({
          ign: member.ign,
          onlineTime: member.online_time || "00:00:00",
        });
      }
    });

    // Save updated rosterDB
    await roster.write();
  } catch (error) {
    console.error("Error in GangPlayerStatus:", error);
  }

  return { ourOnlinePlayers, ourOfflinePlayers };
}

// Main function to send and update player status
let intervalSet = false;

export default async function SendGangPlayerStatus() {
  if (intervalSet) return;
  intervalSet = true;

  const channel = client.channels.cache.get(CHANNEL_ID);
  if (!channel) {
    console.error("Channel not found!");
    return;
  }

  const roster = rosterDB;
  await roster.read();

  let messageId = roster.data.messageId;
  let embedMessage;

  if (messageId) {
    embedMessage = await channel.messages.fetch(messageId).catch(console.error);
  }

  if (!embedMessage) {
    embedMessage = await channel
      .send({ content: "Loading player status..." })
      .catch(console.error);

    roster.data.messageId = embedMessage.id;
    await roster.write();
  }

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

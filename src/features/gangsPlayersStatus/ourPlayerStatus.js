import client from "../../../bot.js";
import { EmbedBuilder } from "discord.js";
import { FetchingServerData } from "../../Component/functionsComponent.js";
import { rosterDB } from "../../Component/db.js";
import moment from "moment-timezone";

const CHANNEL_ID = "1306282347569873087"; // Replace with your status channel ID
const SESSION_LOG_CHANNEL_ID = "1333914768519593984"; // Replace with your session log channel ID
const ASH_COLOR = "#778899"; // Ash-grey color
const LIGHT_RED_COLOR = "#f25252";
const LOGO_URL = "https://i.ibb.co.com/Zd80Pwg/18k-tarf-bg-logo-3.png"; // Replace with your logo URL
const UPDATE_INTERVAL = 10000; // 10 seconds

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
  try {
    const logChannel = client.channels.cache.get(SESSION_LOG_CHANNEL_ID);
    if (!logChannel) {
      console.error("Session log channel not found!");
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(LIGHT_RED_COLOR)
      .setDescription(
        `**${
          member.ign
        }** is offline. Last Session Duration: ${"`"}${sessionDuration}${"`"}`
      );

    await logChannel.send({ embeds: [embed] });
  } catch (error) {
    console.error("Error sending session log:", error);
  }
}

// Process player status
async function GangPlayerStatus() {
  const serverData = await FetchingServerData();
  const serverPlayers = serverData?.Data?.players || [];

  const ourOnlinePlayers = [];
  const ourOfflinePlayers = [];

  try {
    const roster = rosterDB;
    await roster.read();

    const members = roster.data?.members || [];
    const memberMap = new Map(
      members.map((member) => [member.steam_name, member])
    );

    if (!serverPlayers || !Array.isArray(serverPlayers)) {
      console.log("serverPlayers is undefined or not an array.");
      members.forEach((member) => {
        ourOfflinePlayers.push({ ign: member.ign });
      });
      return { ourOnlinePlayers, ourOfflinePlayers };
    }

    // Process online players
    for (const player of serverPlayers) {
      const member = memberMap.get(player.name);
      if (member) {
        if (!member.playerTimer) {
          member.playerTimer = {
            startTime: moment(), // Set start time once when player goes online
          };
        }

        //have to check if there is and online time and will start counting online_time + time.now()
        if (member.online_time) {
        }

        const startTime = moment(member.playerTimer.startTime);
        const elapsedTime = moment().diff(startTime); // Only diff from start time
        member.session_logged = false;

        ourOnlinePlayers.push({
          ign: member.ign,
          // i have to add total time here.
          onlineTime: moment.utc(elapsedTime).format("HH:mm:ss"),
        });
      }
    }

    // Process offline players
    for (const member of members) {
      const isOnline = serverPlayers.some((p) => p.name === member.steam_name);

      if (!isOnline) {
        if (member.playerTimer) {
          const startTime = moment(member.playerTimer.startTime);
          const elapsedTime = moment().diff(startTime);

          const totalOnlineTimeMs = moment
            .duration(member.online_time || "00:00:00")
            .asMilliseconds();
          const newTotalOnlineTimeMs = totalOnlineTimeMs + elapsedTime;

          const sessionDuration = moment.utc(elapsedTime).format("HH:mm:ss");
          const totalOnlineTime = moment
            .utc(newTotalOnlineTimeMs)
            .format("HH:mm:ss");

          if (!member.session_logged) {
            await sendSessionLog(member, sessionDuration, totalOnlineTime);
            member.session_logged = true;
          }

          member.online_time = totalOnlineTime;
          member.playerTimer = null;
        }

        ourOfflinePlayers.push({
          ign: member.ign,
          onlineTime: member.online_time,
        });
      }
    }

    await roster.write();
  } catch (error) {
    console.error("Error processing player status:", error);
  }

  return { ourOnlinePlayers, ourOfflinePlayers };
}

// Main function to send player status updates
export default async function SendOurPlayerStatus() {
  const channel = client.channels.cache.get(CHANNEL_ID);
  if (!channel) {
    console.error("Channel not found!");
    return;
  }

  const roster = rosterDB;
  await roster.read();

  // Dynamic message ID functionality
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

  // Main interval for updates
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

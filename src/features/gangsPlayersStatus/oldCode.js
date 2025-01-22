import { EmbedBuilder } from "discord.js";
import client from "../../../bot.js";
import { FetchingServerData } from "../../Component/functionsComponent.js";
import { rosterDB } from "../../Component/db.js";
import moment from "moment-timezone";

const ourPlayers = [
  "Lord VOLDEMORT",
  "POLO",
  "MrShoaibPlays",
  "Samrat",
  "mr.saru",
  "456comeon",
  "Jobayed_Hossan_GG",
  "Hossain Ovi",
  "RicoNGL",
  "Ro Cky",
  "Rasin Ra",
  "Ahanaf243",
  "imran597687",
  // "NEON VALOR",
  // "GameOver",
  // "NM_DragonistRD",
];

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
    const today = moment.tz("Asia/Dhaka").format("YYYY-MM-DD HH:mm:ss");

    // loading database
    const db = rosterDB;
    await db.read();

    // Online players
    serverPlayers.forEach((player) => {
      // const targetedMember = bd.data.members.find(m => m.steam_name === player.name);
      // if (!targetedMember) {
      //   return
      // }

      if (ourPlayers.includes(player.name)) {
        ourOnlinePlayers.push(player.name);
      }
    });

    // Offline players
    ourPlayers.forEach((player) => {
      if (!ourOnlinePlayers.includes(player)) {
        ourOfflinePlayers.push(player);
      }
    });
  } catch (error) {
    console.error("Error in GangPlayerStatus:", error);
  }

  return { ourOnlinePlayers, ourOfflinePlayers };
}

export default async function SendGangPlayerStatus() {
  const channel = client.channels.cache.get("1306282347569873087");

  // Attempt to fetch the last sent message by the bot
  let embedMessage = await channel.messages
    .fetch({ limit: 1 })
    .then((messages) =>
      messages.find((msg) => msg.author.id === client.user.id)
    )
    .catch(console.error);

  // If no message exists, send a new one; otherwise, use the existing one
  if (!embedMessage) {
    embedMessage = await channel
      .send({ content: "Loading player status..." })
      .catch(console.error);
  }

  // Update the embed message every 10 seconds
  setInterval(async () => {
    const { ourOnlinePlayers, ourOfflinePlayers } = await GangPlayerStatus();

    // Create an embed message with ash-themed colour and formatted spacing
    const embed = new EmbedBuilder()
      .setColor("#778899") // Ash-grey colour
      .setTitle("***THE 18K SIN's*** **Player Status**")
      .setDescription("Status updates every 10 seconds.")
      // .setThumbnail("https://i.ibb.co.com/yRH3dm3/18k-new-logo.png")

      .addFields(
        { name: "\u200B", value: "\u200B", inline: false }, // Blank field for spacing
        {
          name: "**💚 Online Players**",
          value: `\`\`\`➢ ${ourOnlinePlayers.join("\n➢ ") || "None"} \`\`\``,
          length: 200,
          inline: true,
        },

        // { name: "\u200B", value: "\u200B", inline: true }, // Blank field for spacing

        {
          name: "**❤️ Offline Players**",
          value: `\`\`\`➢ ${ourOfflinePlayers.join("\n➢ ") || "None"} \`\`\``,
          inline: true,
        }
      )
      .setImage("https://i.ibb.co.com/Zd80Pwg/18k-tarf-bg-logo-3.png")
      .setTimestamp();

    // Edit the existing message with the new embed content
    await embedMessage
      .edit({ embeds: [embed] })
      .catch((error) => console.log(error));
  }, 10000);
}

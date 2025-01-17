import fs from "fs";
import { EmbedBuilder } from "discord.js";
// import GangData from "../../../serverPlayerData.json" assert { type: "json" };
import { FetchingServerData } from "../../Component/functionsComponent.js";
import client from "../../../bot.js";

const GangData = () => {
  try {
    const data = fs.readFileSync("./DB/serverPlayerData.json", "utf8");
    const GangData = JSON.parse(data);

    return GangData;
  } catch (err) {
    console.error("Error reading JSON file:", err);
  }
};

async function allGangPlayersStatus() {
  try {
    const serverData = await FetchingServerData();
    const ServePlayerData = serverData?.Data?.players || [];

    const updatedGangsPlayerData = [];

    GangData().forEach((gang) => {
      const onlinePlayers = [];
      const offlinePlayers = [];

      gang.players_data.forEach((localPlayer) => {
        const isOnline = ServePlayerData.some(
          (fetchPlayer) => fetchPlayer.name === localPlayer.name
        );

        if (isOnline) {
          onlinePlayers.push(localPlayer);
        } else {
          offlinePlayers.push(localPlayer);
        }
      });

      updatedGangsPlayerData.push({
        gang_name: gang.gang_name,
        players: {
          onlinePlayers,
          offlinePlayers,
        },
      });
    });

    return updatedGangsPlayerData;
  } catch (error) {
    console.error("Error fetching gang player status:", error);
    return [];
  }
}

export default function sendAllGangsPlayerStatus() {
  const channelId = "1310195129809895485";

  setInterval(async () => {
    try {
      const channel = await client.channels.fetch(channelId);
      const statusMessage = await channel.messages.fetch("1310351153401298964");

      const detailsStatusMessage = await channel.messages.fetch(
        "1327721811571507230"
      );
      if (!channel) {
        console.error("Channel not found!");
        return;
      }

      const allGangStatus = await allGangPlayersStatus();

      const GangsStatusEmbed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("Halka Gorib Gangs Status")
        .setDescription("\u200B")
        .setTimestamp()
        .setImage("https://i.ibb.co/TTH4L99/gang-status.png");

      allGangStatus.forEach((gang) => {
        const onlineCount = gang.players.onlinePlayers.length;
        // const offlineCount = gang.players.offlinePlayers.length;

        GangsStatusEmbed.addFields({
          name: `${gang.gang_name}`,
          value: `\`\`\`${onlineCount}\`\`\``,
          inline: true,
        });
      });

      const gangDetailsEmbeds = [];

      const processName = (data) => {
        let Data = [];

        data.forEach((data) => {
          Data.push(data.name);
          // stringData = `${stringData} ${+} ${data.name}`
        });

        if (Data.length === 0) {
          return "";
        } else {
          return `◈ ${Data.join(" \n◈ ")}`;
        }
      };

      allGangStatus.forEach((gang, index) => {
        //
        //
        const gangColor = (gang) => {
          let color = "";
          switch (gang.gang_name) {
            case "18K SINS":
              color = "#a3a3a2";
              break;
            case "Chang Gang":
              color = "#634906";
              break;
            case "Yakuza":
              color = "#ded600";
              break;
            case "Xnax Cartel":
              color = "#8005f2";
              break;
            case "Zerox":
              color = "#3d8503";
              break;
            case "Bombshells":
              color = "#eff2ed";
              break;
            case "Bloods":
              color = "#c22b06";
              break;
            case "Anxious Goons":
              color = "#ff3300";
              break;
            case "Outlaws":
              color = "#000000";
              break;
            default:
              color = "#111111";
              break;
          }

          return color;
        };

        const gangDetail = new EmbedBuilder()
          .setColor(`${gangColor(gang)}`)
          .setTitle(`## ${gang.gang_name}`)
          .setDescription("\u200B")
          .addFields(
            {
              name: `💚 Online Players  ${gang.players.onlinePlayers.length}`,

              value: `\`\`\`${
                processName(gang.players.onlinePlayers) || " ◈ None"
              }\`\`\``,

              inline: true,
            },
            {
              name: `❤️️ Offline Players  ${gang.players.offlinePlayers.length}`,
              value: `\`\`\`${
                processName(gang.players.offlinePlayers) || " ◈ None"
              }\`\`\``,
              inline: true,
            }
          )
          .setImage("https://i.ibb.co/TTH4L99/gang-status.png")
          .setFooter({ text: `Footer for embed` })
          .setTimestamp();

        gangDetailsEmbeds.push(gangDetail);
      });

      await statusMessage
        .edit({ embeds: [GangsStatusEmbed] })
        .catch((error) => console.log("Error updating embed:", error));

      // await detailsStatusMessage
      //   .edit({ embeds: gangDetailsEmbeds })
      //   .catch((error) => console.log("Error updating embed:", error));
    } catch (error) {
      console.error("Error sending gang player status:", error);
    }
  }, 30000);
}

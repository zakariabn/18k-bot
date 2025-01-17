import { EmbedBuilder } from "discord.js";
import {
  FetchingServerData,
  startWordRemove,
} from "../../Component/functionsComponent.js";

async function GettingPlayerData(playerId) {
  try {
    const serverData = await FetchingServerData();

    if (!serverData) {
      return "Error! Result Not Found";
    } else {
      const player = serverData?.Data?.players?.find((p) => {
        if (p.id === playerId) {
          return p;
        } else {
          // console.log("no match found");
        }
      });
      return player;
    }
  } catch (error) {
    console.log(error);
  }
}

async function sendPlayerInfo(message) {
  try {
    const playerID = parseInt(startWordRemove(message.content));

    //checking this player id type number or not.
    if (/^[0-9]+$/.test(playerID)) {
      const player = await GettingPlayerData(playerID);

      // player embeds. sending player info in this embeds
      const playerEmbed = new EmbedBuilder().setColor("#778899").addFields({
        name: "Player Info",
        value: `\`\`\`Name : ${player?.name || "not found"}    \n  ID : ${
          player?.id || "not found"
        } \`\`\``,
      });

      message.reply({ embeds: [playerEmbed] });
    } else {
      message.channel.send("Please input valid command. EX. `-player 001`");
    }
  } catch (error) {
    console.log(error);
  }
}

export default async function sendPlayerDetailInfo(message) {
  try {
    const playerID = parseInt(startWordRemove(message.content));

    //checking this player id type number or not.
    if (/^[0-9]+$/.test(playerID)) {
      const player = await GettingPlayerData(playerID);

      // player embeds. sending player info in this embeds
      const playerEmbed = new EmbedBuilder()
        .setColor("#778899")
        .setTitle(`Details information of ${player?.name}`)
        .setDescription(" . ")
        .addFields({
          name: "Player Info",
          value: `\`\`\`Name : ${player?.name || "not found"}    \n  ID : ${
            player?.id || "not found"
          } \`\`\``,
        });

      message.reply({ embeds: [playerEmbed] });
    } else {
      message.channel.send("Please input valid command. EX. `-player 001`");
    }
  } catch (error) {
    console.log(error);
  }
}

export { sendPlayerInfo, sendPlayerDetailInfo };

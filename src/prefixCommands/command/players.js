import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { FetchingServerData } from "../../Component/functionsComponent.js";
import client from "../../../bot.js";

export default async function sendPlayersInfo(message) {
  try {
    const { Data } = await FetchingServerData();

    //DESTRUCTURE Data
    const playersData = Data?.players;

    function stringifyData(data) {
      let stringData = [];

      for (let d of data) {
        stringData.push(`[${d.id}] ${d.name}          `);
      }
      return stringData;
    }

    //sending 30 player info a time.
    if (playersData.length <= 30) {
      const playerInfo = new EmbedBuilder().addFields(
        {
          name: "FiveM Server Players List",
          value: "\u200B",
        },
        {
          name: "Server Info",
          value: `**Name**: ${Data?.hostname
            .split("|")[0]
            .trim()
            .replace(/\^\d+/g, "")}\n **Players**: ${Data?.clients}/${
            Data?.sv_maxclients
          }`,
        },

        {
          name: `Showing ${playersData.length} players`,
          value: `\`\`\`${stringifyData(playersData).join("\n")} \`\`\``,
        }
      );

      message.channel.send({ embeds: [playerInfo] });
    } else {
      Pagination();
    }

    // if there is more then 30 player, showing 20 Players data at a time.
    function Pagination() {
      function createEmbed(page = 0, pageSize = 20) {
        const start = page * pageSize;
        const end = start + pageSize;
        const paginatedData = playersData.slice(start, end);
        // console.log(paginatedData);

        return new EmbedBuilder()
          .setThumbnail(`${Data?.ownerProfile}`)
          .addFields(
            {
              name: "FiveM Server Players List",
              value: "\u200B",
            },
            {
              name: "Server Info",
              value: `**Name**: ${`Halka Gorib`}\n **Players**: ${
                Data?.clients
              }/${Data?.sv_maxclients}`,
            },

            {
              name: `Showing ${paginatedData.length} players`,
              value: `\`\`\`${stringifyData(paginatedData).join("\n")} \`\`\``,
            }
          )
          .setFooter({
            text: `Page 1/${page + 1}`,
          })
          .setTimestamp();
      }

      // Pagination handler
      client.on("interactionCreate", async (interaction) => {
        if (!interaction.isButton()) return;

        const [action, currentPage] = interaction.customId.split("-");
        let page = parseInt(currentPage);

        if (action === "next") page++;
        if (action === "prev") page--;

        // Ensure page is within bounds
        page = Math.max(
          0,
          Math.min(Math.ceil(playersData.length / 10) - 1, page)
        );

        // Update embed and buttons
        const embed = createEmbed(page);
        const buttons = createPaginationButtons(page);

        await interaction.update({ embeds: [embed], components: [buttons] });
      });

      // Create pagination buttons
      function createPaginationButtons(currentPage) {
        return new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`prev-${currentPage}`)
            .setLabel("Previous")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(currentPage === 0), // Disable if on the first page
          new ButtonBuilder()
            .setCustomId(`next-${currentPage}`)
            .setLabel("Next")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(currentPage === Math.ceil(playersData.length / 20) - 1) // Disable if on the last page
        );
      }

      // Command to trigger the embed
      const embed = createEmbed(0); // Start with the first page
      const buttons = createPaginationButtons(0); // Create initial buttons
      message.channel.send({ embeds: [embed], components: [buttons] });
    }
  } catch (error) {
    console.log(error);
  }
}

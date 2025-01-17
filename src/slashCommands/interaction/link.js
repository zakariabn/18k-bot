import { EmbedBuilder } from "discord.js";

export default async function HandlingLink(params) {
  const usefulLink = new EmbedBuilder()
    .setColor("#778899")
    .setTitle("Useful Link for 18k Sin's")
    .setDescription("................................................")
    .addFields(
      {
        name: "➥ Youtube Chanel",
        value: "[The 18k SIN's](https://www.youtube.com/@the18ksin)",
      },
      {
        name: "➥ Discord Link",
        value: "[Discord](https://discord.gg/nJmrNVB7nt)",
      }
    );

  await interaction
    .reply({ embeds: [usefulLink] })
    .catch((error) => console.log(error));
}

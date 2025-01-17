import fs from "fs";
export default async function handlingRosterUpdate(interaction) {
  const { commandName, options, channel } = interaction;

  const rosterData = () => {
    try {
      const data = fs.readFileSync("./DB/roster.json", "utf8");
      const rosterData = JSON.parse(data);
      return rosterData;
    } catch (err) {
      console.error("Error reading JSON file:", err);
    }
  };

  const data = await rosterData();

  let formattedText = "";

  data.roster.forEach((roleEntry) => {
    for (const [role, names] of Object.entries(roleEntry)) {
      // Ensure names are always treated as an array
      const namesList = Array.isArray(names) ? names : [names];
      formattedText += `${"```" + role.toUpperCase() + "```"}\n${
        "@" + namesList.join("\n@")
      }\n\n`;
    }
  });

  await interaction.deferReply({ ephemeral: true });
  await channel.send({ content: formattedText });

  // Send a bot message to the channel
  //interaction
  await interaction.editReply("Your message send successfully");
}

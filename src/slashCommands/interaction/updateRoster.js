import UpdateRoster from "../../features/updateRoster.js";

export default async function handlingRosterUpdate(interaction) {
  const { commandName, options, channel } = interaction;

  //handling interaction waiting...
  await interaction.deferReply({ ephemeral: true });

  UpdateRoster();

  await interaction.editReply("Roster Updated");
}

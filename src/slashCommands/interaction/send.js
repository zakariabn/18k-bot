export default async function handlingSend(interaction) {
  const { commandName, options, channel } = interaction;

  const text = options.getString("text");
  // Acknowledge the interaction to avoid "This interaction failed" error
  await interaction.deferReply({ ephemeral: true });

  // Send a bot message to the channel
  await channel.send({ content: text });

  //interaction
  await interaction.editReply("Your message send successfully");
}

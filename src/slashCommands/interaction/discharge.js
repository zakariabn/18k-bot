export default async function handlingDischarge(interaction) {
  const { commandName, options, channel } = interaction;

  const user = options.getUser("user_option");
  // const user = options.getUser("choose_member")
  const reason = options.getString("reason");
  const lastMessage =
    options.getString("end_message") ||
    "Thanks for your time. Hope you will be back ! 💖";

  const dischargeFormat = `<@${user.id}> You're Discharged from **THE 18K SIN'S**. \n\nReason : **${reason}** \n\n${lastMessage}`;

  console.log(user);
  console.log(dischargeFormat);

  await interaction.deferReply({ ephemeral: true });

  // Send a bot message to the channel
  const sendMessage = await channel.send({ content: dischargeFormat });
  await sendMessage.react("🫡");

  //interaction
  await interaction.editReply("Your message send successfully");
}

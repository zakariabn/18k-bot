export default async function handlingPromotion(interaction) {
  const { options, channel, guild } = interaction;
  await interaction.deferReply({ ephemeral: true });

  const user = guild.members.cache.get(options.getUser("user_option")?.id);
  const rank = options.getString("rank");

  if (!user || !rank) {
    return interaction.editReply({
      content: "Invalid user or rank provided.",
      ephemeral: true,
    });
  }

  // Ensure bot has a higher role
  const botMember = guild.members.me;
  if (botMember.roles.highest.position <= user.roles.highest.position) {
    return interaction.editReply({
      content: `I cannot manage roles for <@${user.id}> because their role is higher or equal to mine.`,
      ephemeral: true,
    });
  }

  const db = rosterDB;
  await db.read();
  const member = db.data.members.find((m) => m.discord_user_id === user.id);

  if (!member) {
    return interaction.editReply({
      content: `<@${user.id}> not found in the roster. Promotion request failed.`,
      ephemeral: true,
    });
  }

  const tksRoles = rolesDB;
  await tksRoles.read();
  const currentRole = member.role;
  const currentRoleId = tksRoles.data.roles.find((r) => r.name === currentRole);
  const nextRole = tksRoles.data.roles.find((r) => r.name === rank);

  if (!nextRole) {
    return interaction.editReply({
      content: `The specified rank **${rank}** does not exist in the roles database.`,
      ephemeral: true,
    });
  }

  // Update roles in Discord
  try {
    if (currentRoleId) await user.roles.remove(currentRoleId.id);
    await user.roles.add(nextRole.id);
  } catch (error) {
    console.error("Error updating roles:", error);
    return interaction.editReply({
      content: `Failed to update roles for <@${user.id}>. Please check my permissions.`,
      ephemeral: true,
    });
  }

  // Update database
  const newTagNumber = nextRole.last_tag_number + 1;
  nextRole.last_tag_number = newTagNumber;
  const today = moment.tz("Asia/Dhaka").format("YYYY-MM-DD HH:mm:ss");

  member.role = rank;
  member.role_history.push({ role: rank, promote_date: today });

  try {
    await db.write();
    await tksRoles.write();
  } catch (error) {
    console.error("Error writing to the database:", error);
    return interaction.editReply({
      content: `Failed to update the roster database.`,
      ephemeral: true,
    });
  }

  // Send promotion message
  const promotionMessage = `<@${user.id}> **Congratulations** 🎉 🎉 🎉 🎉 \n\nYou have been promoted to <@&${nextRole.id}> of **THE 18K SIN's.**\n> Your name tag is **${nextRole.initial}-${newTagNumber} | ${user.displayName}**`;

  try {
    await channel.send(promotionMessage);
  } catch (error) {
    console.error("Error sending promotion message:", error);
    return interaction.editReply({
      content: `Failed to send the promotion message in the channel.`,
      ephemeral: true,
    });
  }

  await interaction.editReply(
    `<@${user.id}> has been promoted to **${rank}**. The roster has been updated.`
  );
}

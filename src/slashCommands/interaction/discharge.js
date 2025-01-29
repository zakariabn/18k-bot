import { rosterDB, rolesDB } from "../../Component/db.js";
import UpdateRoster from "../../features/updateRoster.js";

export default async function handlingDischarge(interaction) {
  const { options, channel, guild } = interaction;
  await interaction.deferReply({ ephemeral: true });

  // Fetch the user as a GuildMember
  const user = guild.members.cache.get(options.getUser("user_option").id);
  const reason = options.getString("reason");
  const lastMessage =
    options.getString("end_message") ||
    "Thanks for your time & effort. Hope you will be back! 💖";

  // Load the roster database
  const db = rosterDB;
  await db.read();

  // Find the member in the database
  const memberIndex = db.data.members.findIndex(
    (m) => m.discord_user_id === user?.id
  );

  if (memberIndex === -1) {
    await interaction.editReply({
      content: `<@${
        user?.id || "user"
      }> is not in the roster. Discharge request failed.`,
      ephemeral: true,
    });
    console.log("Member not found in roster.");
    return;
  }

  const member = db.data.members[memberIndex];

  // Load roles database
  const tksRoles = rolesDB;
  await tksRoles.read();

  // Remove Discord roles
  const currentRoleId = tksRoles.data.roles.find((r) => r.name === member.role);
  try {
    if (currentRoleId) {
      await user.roles.remove(tksRoles.data.tks_role);
      await user.roles.remove(currentRoleId.id);
    }
  } catch (error) {
    console.error("Error removing roles:", error);
    await interaction.editReply({
      content: `Failed to update roles for <@${user.id}>. Please check my permissions.`,
      ephemeral: true,
    });
    return;
  }

  // Move the member to the discharged_members array
  if (!db.data.discharged_members) {
    db.data.discharged_members = [];
  }

  // Add member to the discharged_members array with discharge info
  const today = new Date().toISOString();
  db.data.discharged_members.push({
    ...member,
    discharge_date: today,
    discharge_reason: reason,
  });

  // Remove the member from the members array
  db.data.members.splice(memberIndex, 1);

  try {
    // Write the changes to the database
    await db.write();
  } catch (error) {
    console.error("Error writing to the database:", error);
    await interaction.editReply({
      content: `Failed to update the roster database.`,
      ephemeral: true,
    });
    return;
  }

  // Update the roster
  await UpdateRoster();

  // Send a discharge message to the channel
  const dischargeFormat = `<@${user.id}> You're discharged from **THE 18K SIN'S**, For **${reason}** \n\n${lastMessage}`;

  try {
    const sendMessage = await channel.send({ content: dischargeFormat });
    await sendMessage.react("🫡");
  } catch (error) {
    console.error("Error sending discharge message:", error);
    await interaction.editReply({
      content: `Failed to send the discharge message in the channel.`,
      ephemeral: true,
    });
    return;
  }

  // Interaction response
  await interaction.editReply(
    `<@${user.id}> has been discharged and moved to the discharged members list. The roster has been updated.`
  );
}

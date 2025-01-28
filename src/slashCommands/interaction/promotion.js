import { rosterDB, rolesDB } from "../../Component/db.js"; // Import databases
import moment from "moment-timezone"; // For handling timestamps
import UpdateRoster from "../../features/updateRoster.js"; // Ensure this exists and is correctly implemented

export default async function handlingPromotion(interaction) {
  const { options, channel, guild } = interaction;
  await interaction.deferReply({ ephemeral: true });

  try {
    // Fetching the user as a GuildMember
    const user = guild.members.cache.get(options.getUser("user_option").id);
    const rank = options.getString("rank");
    const promotionMessage = options.getString("name-tag");

    // Load Roster database
    const db = rosterDB;
    await db.read();

    // Finding target member in the database
    const member = db.data.members.find((m) => m.discord_user_id === user?.id);

    if (!member) {
      await interaction.editReply({
        content: `<@${
          user?.id || "user"
        }> not found in the roster. Promotion request failed.`,
        ephemeral: true,
      });
      console.log("Member not found in roster.");
      return;
    }

    // Load roles database
    const tksRoles = rolesDB;
    await tksRoles.read();

    // Validate roles
    const currentRole = member.role;
    const currentRoleId = tksRoles.data.roles.find(
      (r) => r.name === currentRole
    );
    const nextRole = tksRoles.data.roles.find((r) => r.name === rank);

    if (!nextRole) {
      await interaction.editReply({
        content: `The specified rank **${rank}** does not exist in the roles database.`,
        ephemeral: true,
      });
      return;
    }

    if (!currentRoleId) {
      console.log(
        `Current role **${currentRole}** for <@${user.id}> not found in the roles database.`
      );
    }

    // Increment the last tag number
    nextRole.last_tag_number += 1;

    // Update Discord roles
    try {
      if (currentRoleId) await user.roles.remove(currentRoleId.id);
      await user.roles.add(nextRole.id);
    } catch (error) {
      console.error("Error updating roles:", error);
      await interaction.editReply({
        content: `Failed to update roles for <@${user.id}>. Please check my permissions.`,
        ephemeral: true,
      });
      return;
    }

    // Update member's role and history in the database
    const today = moment.tz("Asia/Dhaka").format("YYYY-MM-DD HH:mm:ss");

    member.role_history.push({
      role: rank,
      promote_date: today,
    });

    member.role = rank;

    try {
      await db.write();
      await tksRoles.write();
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

    // Send promotion message to the channel
    const format = `<@${
      user.id
    }>  **Congratulations** 🎉 🎉 🎉 🎉 \n\nYou have been promoted to <@&${
      nextRole.id
    }> of **THE 18K SIN's.**${`\n> Your name tag is **${nextRole.initial}-${nextRole.last_tag_number} | ${user.displayName}**`}`;

    try {
      await channel.send(format);
    } catch (error) {
      console.error("Error sending promotion message:", error);
      await interaction.editReply({
        content: `Failed to send the promotion message in the channel.`,
        ephemeral: true,
      });
      return;
    }

    // Respond to the interaction
    await interaction.editReply(
      `<@${user.id}> has been promoted to **${rank}**. The roster has been updated.`
    );
  } catch (error) {
    console.error("Unexpected error during promotion handling:", error);
    await interaction.editReply({
      content:
        "An unexpected error occurred while processing the promotion request.",
      ephemeral: true,
    });
  }
}

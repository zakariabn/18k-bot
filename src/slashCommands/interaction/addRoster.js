import moment from "moment-timezone";
import { rosterDB, rolesDB } from "../../Component/db.js";
import UpdateRoster from "../../features/updateRoster.js";
import { PermissionsBitField } from "discord.js";

export default async function handlingAddRoster(interaction) {
  const { options, channel, guild } = interaction;
  await interaction.deferReply({ ephemeral: true });

  const user = guild.members.cache.get(options.getUser("member").id);
  const name = options.getString("ign");
  const steamName = options.getString("steam_name");
  const role = options.getString("role");

  // Permission check
  if (
    !interaction.member ||
    !interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)
  ) {
    return interaction.editReply({
      content: "You don't have permission to manage roles.",
      ephemeral: true,
    });
  }

  const today = moment.tz("Asia/Dhaka").format("YYYY-MM-DD HH:mm:ss");

  const rosterData = {
    discord_user_id: user?.id,
    ign: name,
    steam_name: steamName,
    role: role,
    role_history: [
      {
        role: role,
        promote_date: today,
      },
    ],
  };

  const db = rosterDB;
  await db.read();

  // Duplicate check function
  function isDuplicate(user) {
    return (
      db.data.members.some((member) => member.discord_user_id === user.id) ||
      db.data.discharged_members?.some(
        (member) => member.discord_user_id === user.id
      )
    );
  }

  // Prevent adding duplicate members
  if (isDuplicate(user)) {
    return interaction.editReply({
      content: `<@${user?.id}> is already in the roster or discharged members list.`,
      ephemeral: true,
    });
  }

  const tksRoles = rolesDB;
  await tksRoles.read();

  const assignedRole = tksRoles.data.roles.find((r) => r.name === role);
  if (!assignedRole || !tksRoles.data.tks_role) {
    return interaction.editReply({
      content:
        "There was an issue assigning roles. Please check the role database.",
      ephemeral: true,
    });
  }

  // Add roles to the user
  try {
    await user.roles.add(tksRoles.data.tks_role);
    await user.roles.add(assignedRole.id);
  } catch (error) {
    return interaction.editReply({
      content: `Failed to assign roles: ${error.message}`,
      ephemeral: true,
    });
  }

  // Format messages
  const applicationResultFormat = ` ${"```"}  Application Result  ${"```"} \n\n> <@${
    user?.id
  }>\n\n > <:accepted:1282817212910014504> **Your application has been accepted.** \n> You are selected as an <@&1185923287767846923> of THE 18K SIN’S. Best wishes. Wait for your interview. 💖`;

  const recruitFormat = `${"```"}  Recruit  ${"```"} \n\n> <@${
    user?.id
  }>\n > <:accepted:1282817212910014504> **You are recruited as a **${role}** of THE 18K SIN'S.** \n> Welcome to the family. 💐💐💐`;

  // Send appropriate message
  if (role === "ASSOCIATES") {
    await channel.send(applicationResultFormat);
  } else {
    await channel.send(recruitFormat);
  }

  // Add to roster and update the database
  if (!Array.isArray(db.data.members)) {
    db.data.members = [];
  }
  db.data.members.push(rosterData);

  await db.write();
  await UpdateRoster();

  await interaction.editReply(`<@${user?.id}> is Added to Roster`);
}

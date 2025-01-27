import moment from "moment-timezone";
import { rosterDB, rolesDB } from "../../Component/db.js";
import UpdateRoster from "../../features/updateRoster.js";

export default async function handlingAddRoster(interaction) {
  const { commandName, options, channel } = interaction;
  await interaction.deferReply({ ephemeral: true });

  const user = options.getUser("member");
  const name = options.getString("ign");
  const steamName = options.getString("steam_name");
  const role = options.getString("role");
  const addMessage = options.getString("end_message");

  //date format
  const today = moment.tz("Asia/Dhaka").format("YYYY-MM-DD HH:mm:ss");

  // collection data from option.
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

  if (
    !interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)
  ) {
    return interaction.editReply({
      content: "You don't have permission to manage roles.",
      ephemeral: true,
    });
  }

  //giving discord role
  const tksRoles = await rolesDB.read();

  const assignedRoleId = tksRoles.data.roles.find((r) => r.name === role);
  if (assignedRoleId) {
    await user.roles.add(tksRoles.data.tks_role);
    await user.roles.add(assignedRoleId.id);
  }

  // 2 format.
  const applicationResultFormat = ` ${"```"}  Application Result  ${"```"} \n\n> <@${
    user?.id
  }>\n\n > <:accepted:1282817212910014504> **Your application has been accepted.** \n> You are selected as an <@&1185923287767846923> of THE 18K SIN’S. Best wishes. Wait for your interview. 💖`;

  const recruitFormat = `${"```"}  Recruit  ${"```"} \n\n> <@${
    user?.id
  }>\n > <:accepted:1282817212910014504> **You are recruited as a **${role}** of THE 18K SIN'S.** \n> Welcome to the family. 💐💐💐`;

  // Sending a recruitment message to this chanel.
  if (role === "ASSOCIATES") {
    await channel.send(applicationResultFormat);
  } else {
    await channel.send(recruitFormat);
  }

  //loading database -- updating database
  const db = rosterDB;
  await db.read();
  await db.data.members.push(rosterData);

  // writing data to the db
  await db.write();

  // updating roster
  await db.read();
  await UpdateRoster();

  await interaction.editReply(`<@${user?.id}> is Added to Roster`);
}

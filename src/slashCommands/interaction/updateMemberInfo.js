import moment from "moment-timezone";
import { rosterDB } from "../../Component/db.js";
import UpdateRoster from "../../features/updateRoster.js";

export default async function handlingUpdateMemberInfo(interaction) {
  const { options, channel } = interaction;
  await interaction.deferReply({ ephemeral: true });

  const user = options.getUser("member");
  const name = options.getString("ign");
  const steamName = options.getString("steam_name");

  //date format
  const today = moment.tz("Asia/Dhaka").format("YYYY-MM-DD HH:mm:ss");

  //loading database
  const db = rosterDB;
  await db.read();

  let targetedMember = db.data.members.find(
    (m) => m.discord_user_id === user.id
  );

  if (!targetedMember) {
    console.log(`${user.username} not found. Update member failed`);
    await interaction.editReply(
      `<@${user.id}> isn't in the roster. Use /add-roster to add.`
    );
    return;
  }

  // updating new user data and writing to database.
  targetedMember.ign = name;
  targetedMember.steam_name = steamName;

  if (!Array.isArray(targetedMember.last_info_updated)) {
    targetedMember.last_info_updated = [];
  }
  targetedMember.last_info_updated.push(today);

  // saving changes.
  await db.write();

  await interaction.editReply(
    `${targetedMember.ign}'s information has been updated.`
  );

  // updating roster list in roster channel.
  await db.read();
  await UpdateRoster();
}

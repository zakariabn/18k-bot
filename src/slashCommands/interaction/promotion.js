import fs from "fs";
import { rosterDB, rolesDB } from "../../Component/db.js";
import moment from "moment-timezone";
import UpdateRoster from "../../features/updateRoster.js";

export default async function handlingPromotion(interaction) {
  const { commandName, options, channel } = interaction;
  await interaction.deferReply({ ephemeral: true });

  // Function to promote a member

  const user = options.getUser("user_option");
  const rank = options.getString("rank");
  const promotionMessage = options.getString("name-tag");

  //load Roster database
  const db = rosterDB;
  await db.read();

  // finding target member by there user name
  const member = db.data.members.find((m) => m.discord_user_id === user.id);

  if (!member) {
    await interaction.editReply(
      `<@${user?.id || "user"}> not found. Request failed`
    );
    console.log("member not fond");
    return;
  }

  //Removing discord role
  const tksRoles = await rolesDB.read();
  const currentRole = member.role;

  const nextRole = tksRoles.data.roles.find((r) => r.name === rank);
  const currentRoleId = tksRoles.data.roles.find((r) => r.name === currentRole);
  if (currentRoleId) {
    await user.roles.remove(currentRoleId.id);
    await user.roles.add(nextRole.id);
  }

  const today = moment.tz("Asia/Dhaka").format("YYYY-MM-DD HH:mm:ss");

  member.role_history.push({
    role: rank,
    promote_day: today,
  });

  //chenging his role
  member.role = rank;
  await db.write();

  //updating roster
  await db.read();
  await UpdateRoster();

  //sending promotion message to channel

  const format = `<@${
    user.id
  }>  **Congratulations** 🎉 🎉 🎉 🎉 \nYou have been promoted to **${rank}** of **The 18K Sin's.** ${
    !promotionMessage ? " " : `\n> Your name tag is **${promotionMessage}**`
  }`;
  await channel.send(format);
  await interaction.editReply(
    `<@${user.id}> Promoted to **${rank}**. And roster is updated.`
  );
}

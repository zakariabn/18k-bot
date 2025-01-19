import fs from "fs";
import { rosterDB } from "../../Component/db.js";
import moment from "moment-timezone";

export default async function handlingPromotion(interaction) {
  const { commandName, options, channel } = interaction;
  await interaction.deferReply({ ephemeral: true });

  // Function to promote a member

  const user = options.getUser("user_option");
  const rank = options.getString("rank");
  const promotionMessage = options / getString("end_message");

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

  const oldRole = member.role;
  const today = moment.tz("Asia/Dhaka").format("YYYY-MM-DD HH:mm:ss");

  member.role_history.push({
    role: rank,
    promote_day: today,
  });

  //chenging his role
  member.role = rank;
  await db.write();

  //sending promotion message to channel

  const format = `<@${user.id}>  **Congratulations** 🎉 🎉 🎉 🎉 \nYou have been promoted to **${rank}** of **The 18K Sin's** \n> Your name tag is ${promotionMessage}`;
  await channel.send(format);
  await interaction.editReply(
    `<@${user.id}> Promoted to **${rank}**. And roster is updated.`
  );
}

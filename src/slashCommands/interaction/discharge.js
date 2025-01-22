import { rosterDB } from "../../Component/db.js";
import UpdateRoster from "../../features/updateRoster.js";

export default async function handlingDischarge(interaction) {
  const { commandName, options, channel } = interaction;
  await interaction.deferReply({ ephemeral: true });

  //defining database
  const db = rosterDB;

  const user = options.getUser("user_option");
  // const user = options.getUser("choose_member")
  const reason = options.getString("reason");
  const lastMessage =
    options.getString("end_message") ||
    "Thanks for your time. Hope you will be back ! 💖";

  // loading data
  await db.read();

  const member = db.data.members.find((m) => m.discord_user_id === user.id);

  // if (!targetedMember) {
  //   console.log(`${member.userName} not found. Update member failed`);
  //   await interaction.editReply(`<@${member.id}> isn't in the roster. Use /add-roster to add.`)
  //   return
  // }

  if (member) {
    member.role = "DISCHARGED";

    // writhing updated data
    db.write();
  }

  const dischargeFormat = `<@${user.id}> You're Discharged from **THE 18K SIN'S**. \n\nReason : **${reason}** \n\n${lastMessage}`;

  // Send a bot message to the channel
  const sendMessage = await channel.send({ content: dischargeFormat });
  await sendMessage.react("🫡");

  //updating roster
  await db.read();
  await UpdateRoster();

  //interaction
  await interaction.editReply(
    `<@${user.id}> is Discharged. And roster is updated.`
  );
}

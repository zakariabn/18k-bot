import moment from "moment-timezone";
import { rosterDB } from "../../Component/db.js";
import UpdateRoster from "../../features/updateRoster.js";

export default async function handlingAddRoster(interaction) {
  const { commandName, options, channel } = interaction;
  await interaction.deferReply({ ephemeral: true });

  const member = options.getUser("member");
  const name = options.getString("ign");
  const role = options.getString("role");
  const addMessage = options.getString("end_message");

  //date format
  const today = moment.tz("Asia/Dhaka").format("YYYY-MM-DD HH:mm:ss");

  // collection data from option.
  const rosterData = {
    discord_user_id: member?.id,
    real_name: name,
    role: role,
    role_history: {
      role: role,
      promote_date: today,
    },
  };

  // 2 format.
  const applicationResultFormat = ` ${"```"}  Application Result  ${"```"} \n\n> <@${
    member?.id
  }>\n\n > <:accepted:1282817212910014504> **Your application has been accepted.** \n> You are selected as an <@&1185923287767846923> of THE 18K SIN’S. Best wishes. Wait for your interview. 💖`;

  const recruitFormat = `${"```"}  Recruit  ${"```"} \n\n> <@${
    member?.id
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

  await interaction.editReply(`<@${member?.id}> is Added to Roster`);
}

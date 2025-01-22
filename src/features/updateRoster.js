import client from "../../bot.js";
import { rosterDB } from "../Component/db.js";

export default async function UpdateRoster() {
  const db = rosterDB;

  // Check if the members array exists
  if (!db || !db.data || !Array.isArray(db.data.members)) {
    console.log("No valid member data found in the database.");
    return;
  }

  const rosterChannel = await client.channels.fetch("1245957793823981599");
  const rosterMessage = await rosterChannel.messages.fetch(
    "1314792065334382642"
  );

  if (!rosterChannel) {
    console.log("Failed to fetch the roster channel.");
    return;
  }
  if (!rosterMessage) {
    console.log("Failed to fetch the roster message.");
    return;
  }

  function groupMembersByRole(members) {
    return members.reduce((acc, member) => {
      const role = member.role.toUpperCase();

      // Skip the role 'DISCHARGE'
      if (role === "DISCHARGED") {
        return acc;
      }

      // Initialize the role in the accumulator if not already present
      if (!acc[role]) {
        acc[role] = [];
      }

      // Add the member's name to the role group
      acc[role].push(member.ign);
      return acc;
    }, {}); // Start with an empty object as the accumulator
  }

  function formatRoleData(groupedData) {
    // Define the role order you want
    const roleOrder = [
      "LEADER",
      "CO-LEADER",
      "ADVISER",
      "STREET BOSS",
      "CAPOREGIME",
      "CHIEF OF ENFORCER",
      "ENFORCER",
      "SOLDIER",
      "ASSOCIATES",
    ];

    let formattedString = "";

    // Loop through the roles in the desired order
    roleOrder.forEach((role) => {
      if (groupedData[role]) {
        formattedString += `**${role.toUpperCase()}**\n* ${groupedData[
          role
        ].join("\n* ")}\n\n`;
      }
    });

    return formattedString;
  }

  //loading database
  await db.read();

  // Proceed with grouping and formatting only if members array is valid
  const groupData = groupMembersByRole(db.data.members);
  const formattedData = formatRoleData(groupData);

  // Check if the data exceeds Discord's character limit
  if (formattedData.length > 2000) {
    const chunks = formattedData.match(/.{1,2000}/g); // Split into chunks of 2000 characters or less
    for (const chunk of chunks) {
      await rosterMessage.edit(chunk); // Edit the message in chunks
    }
  } else {
    await rosterMessage.edit(formattedData); // Edit the message if under the character limit
  }
}

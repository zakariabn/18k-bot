import fs from "fs";
export default function handlingPromotion(params) {
  // Function to promote a member

  function promoteMember(memberName, newRole) {
    // Read the existing JSON database file
    fs.readFile("./DB/roster.json", "utf8", (err, data) => {
      if (err) {
        console.log("Error reading the file:", err);
        return;
      }

      // Parse the file content into a JSON object
      const db = JSON.parse(data);

      // Find the current role of the member
      let currentRole = null;
      for (let role in db.roster) {
        for (let [key, members] of Object.entries(db.roster[role])) {
          if (members.includes(memberName)) {
            currentRole = key;
            break;
          }
        }
      }

      if (!currentRole) {
        console.log("Member not found in any role.");
        return;
      }

      // Remove the member from their current role
      const currentRoleIndex = db.roster.findIndex((role) => role[currentRole]);
      const memberIndex =
        db.roster[currentRoleIndex][currentRole].indexOf(memberName);
      if (memberIndex > -1) {
        db.roster[currentRoleIndex][currentRole].splice(memberIndex, 1);
      }

      // Add the member to the new role
      const newRoleIndex = db.roster.findIndex((role) => role[newRole]);
      if (newRoleIndex > -1) {
        db.roster[newRoleIndex][newRole].push(memberName);
      } else {
        // If the new role doesn't exist, create it
        const newRoleObj = {};
        newRoleObj[newRole] = [memberName];
        db.roster.push(newRoleObj);
      }

      // Write the updated roster back to the JSON file
      fs.writeFile("db.json", JSON.stringify(db, null, 2), "utf8", (err) => {
        if (err) {
          console.log("Error writing to file:", err);
        } else {
          console.log(`${memberName} has been promoted to ${newRole}.`);
        }
      });
    });
  }

  // Example usage
  //   promoteMember("MrShoaibPlays", "CAPOREGIME");
}

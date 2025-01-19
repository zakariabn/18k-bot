import fs from "fs";
export default function handlingPromotion(interaction) {
  // Function to promote a member

  function promoteMember(memberName, newRole) {}

  async function Promotion(name, rank) {
    await db.read();

    const member = db.data.members.find((member) => member.real_name === name);

    if (member) {
      const oldRole = member.role;
      const todaysDate = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Dhaka",
      })
        .format(new Date())
        .replace(/\//g, "-");
      // adding history to role history data
      member.role_history.push({
        role: "Leader",
        promote_day: todaysDate,
      });
      //chenging his role
      member.role = "Leader";
    } else {
      console.log("Member Not found");
    }

    await db.write();
    console.log(member);
  }
}

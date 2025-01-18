import { JSONFilePreset } from "lowdb/node";

export default async function handlingTurfTax(params) {
  const { commandName, options, channel } = interaction;
  const ExpiredTaxChannel = client.channels.cache.get("1329135806904008734");

  //setup db
  const defaultTaxEntry = {
    tax_id: "",
    payer_name: "",
    B_Name: "",
    Validity: "",
    Due: "",
    Paid: "",
    NID: "",
  };
  const db = await JSONFilePreset("DB/turfTax.json", defaultTaxEntry);

  // Command: Add a payment

  // Command: Update a payment

  // Command: Check all payments

  // Task: Check for expired payments
  async function checkExpiredPayments() {
    const data = db.read();
    const now = new Date();
    // const channel = client.channels.cache.get(CHANNEL_ID);

    const expiredTax = [];

    db.data.taxes.forEach((tax) => {
      if (tax.status === "active" && new Date(tax.Validity) < now) {
        tax.status === "expired";
        expiredTax.push(tax.tax_id);
      } else {
        console.log("there is not expired tax");
      }
    });

    if (ExpiredTaxChannel && expiredTax.length !== 0) {
      await db.write();
      ExpiredTaxChannel.send(
        ```${`Tax Expired:`} \n⭕ ${expiredTax.join("\n⭕ ")}```
      );
    }
  }

  // Scheduled job to run every day at midnight
  const job = new cron.CronJob(
    "0 0 * * *", // Run at midnight
    checkExpiredPayments, // Function to check and process expired payments
    null, // No function to run after the task completes
    true, // Automatically start the cron job
    "Asia/Dhaka" // Timezone for Bangladesh
  );
}

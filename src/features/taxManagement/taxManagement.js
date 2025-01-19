import cron from "node-cron";
import { taxDB } from "../../Component/db.js";
import client from "../../../bot.js";

// Define database
const db = taxDB;

// Task: Check for expired payments
async function checkExpiredPayments() {
  // Ensure the database is up-to-date
  await db.read();
  const now = new Date();

  // Fixed channel for expired code
  const ExpiredTaxChannel = client.channels.cache.get("1329135806904008734");
  if (!ExpiredTaxChannel) {
    console.error("Channel not found!");
    return;
  }

  if (!db.data || !db.data.taxes) {
    console.error("Database or taxes data not found!");
    return;
  }

  const expiredTax = [];

  db.data.taxes.forEach((tax) => {
    if (tax.status === "active" && new Date(tax.expired_date) < now) {
      tax.status = "expired";
      expiredTax.push(tax.tax_id);
    }
  });

  if (expiredTax.length > 0) {
    // Save changes to the database
    await db.write();

    // Send a message to the expired tax channel
    ExpiredTaxChannel.send(`Tax Expired: \n⭕ ${expiredTax.join("\n⭕ ")}`);
  } else {
    console.log("No expired taxes found.");
  }
}

// Scheduled job to run every day at midnight
const dailyCornJob = cron.schedule(
  "0 0 * * *",
  // "*/10 * * * * *",
  async () => {
    console.log("Running daily expired payments check...");
    await checkExpiredPayments();
  },
  {
    timezone: "Asia/Dhaka",
  }
);

export { dailyCornJob };

const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
const cron = require("cron");

// Initialize the Discord bot
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
const DATABASE_FILE = "./payments.json";
const CHANNEL_ID = "123456789012345678"; // Replace with your Discord channel ID
const BOT_TOKEN = "YOUR_BOT_TOKEN"; // Replace with your bot token

// Helper functions to manage the JSON database
function loadData() {
  if (!fs.existsSync(DATABASE_FILE)) {
    fs.writeFileSync(DATABASE_FILE, JSON.stringify({ payments: [] }, null, 4));
  }
  return JSON.parse(fs.readFileSync(DATABASE_FILE, "utf8"));
}

function saveData(data) {
  fs.writeFileSync(DATABASE_FILE, JSON.stringify(data, null, 4));
}

// Command: Add a payment
async function addPayment(channel, customerName, paidAmount, expiryDays) {
  const data = loadData();
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + parseInt(expiryDays));

  const newEntry = {
    customer_name: customerName,
    paid_amount: paidAmount,
    expiry_date: expiryDate.toISOString().split("T")[0],
    status: "active",
  };

  data.payments.push(newEntry);
  saveData(data);
  await channel.send(`Payment added: ${JSON.stringify(newEntry, null, 4)}`);
}

// Command: Update a payment
async function updatePayment(channel, customerName, paidAmount, expiryDays) {
  const data = loadData();
  const payment = data.payments.find(
    (p) => p.customer_name.toLowerCase() === customerName.toLowerCase()
  );

  if (payment) {
    payment.paid_amount = paidAmount;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parseInt(expiryDays));
    payment.expiry_date = expiryDate.toISOString().split("T")[0];
    payment.status = "active";

    saveData(data);
    await channel.send(`Payment updated: ${JSON.stringify(payment, null, 4)}`);
  } else {
    await channel.send(`No payment found for customer: ${customerName}`);
  }
}

// Command: Check all payments
async function checkPayments(channel) {
  const data = loadData();
  const activePayments = data.payments.filter((p) => p.status === "active");
  if (activePayments.length > 0) {
    await channel.send(
      `Active payments:\n${JSON.stringify(activePayments, null, 4)}`
    );
  } else {
    await channel.send("No active payments found.");
  }
}

// Task: Check for expired payments
function checkExpiredPayments() {
  const data = loadData();
  const now = new Date();
  const channel = client.channels.cache.get(CHANNEL_ID);

  data.payments.forEach((payment) => {
    if (payment.status === "active" && new Date(payment.expiry_date) < now) {
      payment.status = "expired";
      if (channel) {
        channel.send(`Payment expired: ${JSON.stringify(payment, null, 4)}`);
      }
    }
  });

  saveData(data);
}

// Scheduled job to run every day at midnight
// const job = new cron.CronJob('0 0 * * *', checkExpiredPayments, null, true, 'America/New_York');/

const job = new cron.CronJob(
  "0 0 * * *", // Run at midnight
  checkExpiredPayments, // Function to check and process expired payments
  null, // No function to run after the task completes
  true, // Automatically start the cron job
  "Asia/Dhaka" // Timezone for Bangladesh
);

// Bot event: Ready
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  job.start();
});

// Bot event: Message Create
client.on("messageCreate", async (message) => {
  if (!message.content.startsWith("!") || message.author.bot) return;

  const args = message.content.slice(1).split(" ");
  const command = args.shift().toLowerCase();

  if (command === "addpayment") {
    const [customerName, paidAmount, expiryDays] = args;
    await addPayment(
      message.channel,
      customerName,
      parseFloat(paidAmount),
      parseInt(expiryDays)
    );
  } else if 
  (command === "updatepayment") {
    const [customerName, paidAmount, expiryDays] = args;
    await updatePayment(
      message.channel,
      customerName,
      parseFloat(paidAmount),
      parseInt(expiryDays)
    );
  } else if (command === "checkpayments") {
    await checkPayments(message.channel);
  }
});

// Login to Discord
client.login(BOT_TOKEN);

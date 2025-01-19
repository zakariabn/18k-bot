import client from "../../../bot.js";
import moment from "moment-timezone";
import { EmbedBuilder } from "@discordjs/builders";
import { taxDB } from "../../Component/db.js";

export default async function handlingTurfTax(interaction) {
  const { commandName, options, channel } = interaction;
  const ExpiredTaxChannel = client.channels.cache.get("1329135806904008734");

  // Extracting data form option
  const name = options.getString("payer-name");
  const paidAmount = options.getNumber("paid");
  const dueAmount = options?.getNumber("due") || 0;
  const validity = options.getNumber("validity");
  const nid = options.getAttachment("upload-nid");
  // const nidUrl = file?.attachment;

  //calling database
  const db = taxDB;

  // Reading data
  await db.read();
  const lastTaxCode = db.data.last_tax_code || 0; // Ensure it starts from 0 if undefined
  const newLastTaxCode = lastTaxCode + 1;

  // Generate a new tax code
  const taxCode = `tks-${String(newLastTaxCode).padStart(3, "0")}`;

  // Format dates
  const dateInBD = moment.tz("Asia/Dhaka");

  const validateExpireDate = dateInBD
    .add(parseInt(validity), "days")
    .format("YYYY-MM-DD HH:mm:ss");
  const formattedDate = moment(validateExpireDate)
    .format("DDMMM YYYY")
    .toUpperCase();

  // Handle NID
  const nidAttachment = nid?.attachment || "No attachment provided";

  // Prepare tax entry data
  const taxEntryData = {
    tax_id: taxCode,
    payer_name: name,
    b_Name: "",
    valid: validity,
    expired_date: validateExpireDate,
    due: dueAmount,
    paid: paidAmount,
    collector: {
      name: interaction?.member?.nickname,
      id: interaction?.user?.id,
    },
    nid: nidAttachment,
    status: "active",
  };

  // Collection Embed message.
  const taEntryEmbed = new EmbedBuilder()
    .setColor(0xbdbdbd)
    .setTitle(`**Code** :     **${taxEntryData.tax_id}**`)
    .setDescription("\u200B")
    .addFields(
      {
        name: `**Name: ${name}**`,
        value: `\`\`\`Paid: (${paidAmount} tk) \nDue: ${dueAmount} \`\`\``,
      },
      {
        name: "Expired Date",
        value: `${formattedDate} ${"`"}(${validity} days)${"`"}`,
      }
    )
    .setImage(nidAttachment)
    .setTimestamp()
    .setFooter({
      text: `Collector: ${"`"}${
        interaction?.member?.nickname || interaction?.user?.username
      }${"`"} Time`,
    });
  //

  // Update database
  db.data.last_tax_code = newLastTaxCode;
  db.data.taxes.push(taxEntryData);
  await db.write();

  // Send the embed
  await channel.send({ embeds: [taEntryEmbed] });
}

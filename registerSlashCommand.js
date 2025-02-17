import dotenv from "dotenv";
dotenv.config();

import { REST, Routes } from "discord.js";

const rest = new REST({ version: "10" }).setToken(process.env.APP_TOKEN);

const commands = [
  {
    name: "link",
    description: "You will get all useful links related to 18k sins",
  },
  {
    name: "send",
    description: "Repeats what you say.",
    options: [
      {
        name: "text", // Correct: lowercase and alphanumeric
        type: 3, // STRING
        description: "Text to repeat",
        required: true,
      },
    ],
  },
  {
    name: "discharge",
    description: "Send a preset discharge message with this command.",
    options: [
      {
        name: "user_option", // Correct: lowercase and alphanumeric
        description: "Select a user",
        type: 6, // USER
        required: true,
      },
      {
        name: "reason", // Correct: lowercase and alphanumeric
        type: 3, // STRING
        description: "Reason for discharge",
        required: true,
      },
      {
        name: "end_message", // Correct: lowercase and alphanumeric
        type: 3, // STRING
        description: "Optional end message for discharge",
        required: false,
      },
    ],
  },
  {
    name: "update-roster",
    description: "Repeats what you say.",
  },
  // Promotion command
  {
    name: "promotion",
    description: "Use this for promoting a member to a higher rank",
    options: [
      {
        name: "user_option", // Select a user
        description: "Select a user to promote",
        type: 6, // USER type
        required: true,
      },
      {
        name: "rank", // Reason for promotion
        description: "Select rank",
        type: 3, // STRING
        required: true,
        // Add choices for the promotion reason
        choices: [
          { name: "LEADER", value: "Leader" },
          { name: "CO-LEADER", value: "CO-LEADER" },
          { name: "STREET BOSS", value: "STREET BOSS" },
          { name: "ADVISER", value: "ADVISER" },
          { name: "CAPOREGIME", value: "CAPOREGIME" },
          { name: "CHIEF OF ENFORCER", value: "CHIEF OF ENFORCER" },
          { name: "ENFORCER", value: "ENFORCER" },
          { name: "SOLDIER", value: "SOLDIER" },
          { name: "ASSOCIATES", value: "ASSOCIATES" },
        ],
      },
      {
        name: "name-tag", // Optional end message for promotion
        type: 3, // STRING
        description: "name-tag of this member.",
        required: false,
      },
    ],
  },
  {
    name: "collect-tax",
    description: "This command is used for tax collection system",
    options: [
      {
        name: "payer-name", // Select a user
        description: "Input the name for payer",
        type: 3,
        required: true,
      },
      {
        name: "validity", // Select a user
        description: "This tax validate expired day",
        type: 10,
        required: true,
        choices: [
          { name: "7-day", value: 7 },
          { name: "3-day", value: 3 },
        ],
      },
      {
        name: "paid", // Select a user
        description: "How much payer payed",
        type: 10,
        required: true,
        choices: [
          { name: "10k", value: 10000 },
          { name: "6k", value: 6000 },
        ],
      },
      {
        name: "upload-nid", // Select a user
        description: "Please upload a payer nid card for documentation",
        type: 11,
        required: true,
        options: [
          {
            name: "file", // Correct: lowercase and alphanumeric
            type: 11, // ATTACHMENT
            description: "Upload an image file",
            required: true,
          },
        ],
      },
      {
        name: "due", // Select a user
        description: "Due amount",
        type: 10,
        required: false,
      },
    ],
  },
  {
    name: "add-roster",
    description: "Use this for adding a member to roster list",
    options: [
      {
        name: "member", // Select a user
        description: "Select a user to add",
        type: 6, // USER type
        required: true,
      },
      {
        name: "ign", // Optional end message for promotion
        type: 3, // STRING
        description: "Input his/her in-game name",
        required: true,
      },
      {
        name: "steam_name", // Optional end message for promotion
        type: 3, // STRING
        description: "Input his/her steam-name",
        required: true,
      },
      {
        name: "role", // Reason for promotion
        description: "Select rank",
        type: 3, // STRING
        required: true,
        // Add choices for the promotion reason
        choices: [
          { name: "Leader", value: "Leader" },
          { name: "CO-LEADER", value: "CO-LEADER" },
          { name: "STREET BOSS", value: "STREET BOSS" },
          { name: "ADVISER", value: "ADVISER" },
          { name: "CAPOREGIME", value: "CAPOREGIME" },
          { name: "CHIEF OF ENFORCER", value: "CHIEF OF ENFORCER" },
          { name: "ENFORCER", value: "ENFORCER" },
          { name: "SOLDIER", value: "SOLDIER" },
          { name: "ASSOCIATES", value: "ASSOCIATES" },
        ],
      },
      {
        name: "end_message", // Optional end message for promotion
        type: 3, // STRING
        description: "Optional end message for promotion",
        required: false,
      },
    ],
  },
  {
    name: "update-member-info",
    description: "Use this for updating members info",
    options: [
      {
        name: "member", // Select a user
        description: "Select a user to add",
        type: 6, // USER type
        required: true,
      },
      {
        name: "ign",
        type: 3, // STRING
        description: "Input his/her in-game name",
        required: true,
      },
      {
        name: "steam_name",
        type: 3, // STRING
        description: "Input his/her steam-name",
        required: true,
      },
    ],
  },
];

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    // Use Routes.applicationGuildCommands for guild-specific registration
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID), // For global commands
      { body: commands }
    );

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();

// export const data = new SlashCommandBuilder()
//     .setName('example')
//     .setDescription('Example command with autocomplete')
//     .addStringOption(option =>
//         option.setName('input')
//             .setDescription('Choose or type your input')
//             .setAutocomplete(true)
//             .setRequired(true)
//     );

// export const autocomplete = async (interaction) => {
//     const focusedValue = interaction.options.getFocused();
//     const choices = ['Option 1', 'Option 2', 'Option 3'];
//     const filtered = choices.filter(choice => choice.startsWith(focusedValue));
//     await interaction.respond(
//         filtered.map(choice => ({ name: choice, value: choice }))
//     );
// };

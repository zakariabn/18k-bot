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
    // options: [
    //   {
    //     name: "text", // Correct: lowercase and alphanumeric
    //     type: 3, // STRING
    //     description: "Text to repeat",
    //     required: true,
    //   },
    // ],
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
];

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    // Use Routes.applicationGuildCommands for guild-specific registration
    await rest.put(
      Routes.applicationCommands(clintID), // For global commands
      { body: commands }
    );

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();

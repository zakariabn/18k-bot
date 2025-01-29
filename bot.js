import dotenv from "dotenv";
dotenv.config();
import { Client, Events, GatewayIntentBits } from "discord.js";
import CommandsHandel from "./src/prefixCommands/prefixCommand.js";
// import SendGangPlayerStatus from "./src/features/gangsPlayersStatus/ourGangPlayersStatus.js";
import interactionHandle from "./src/slashCommands/interactionHandel.js";
import sendAllGangsPlayerStatus from "./src/features/gangsPlayersStatus/allGangPlayersStatus.js";
import { dailyCornJob } from "./src/features/taxManagement/taxManagement.js";
import SendOurPlayerStatus from "./src/features/gangsPlayersStatus/ourPlayerStatus.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

//Bot online status checking
client.once(Events.ClientReady, (readyClient) => {
  console.log(`✅ Ready! Successfully Logged in as ${readyClient.user.tag}`);

  // sending 18k player's online-offline status.
  if (readyClient) {
    // Set the bot's custom status
    client.user.setPresence({
      activities: [
        {
          name: "18K SIN's activity", // The status message
          type: 3, // Activity type (e.g., PLAYING, STREAMING, LISTENING, WATCHING)
          // url: "https://www.youtube.com/@the18ksin",
        },
      ],
      status: "online", // Can also be 'idle', 'dnd', or 'invisible'
    });

    // sending status at bot startup
    // SendGangPlayerStatus();
    SendOurPlayerStatus();
    sendAllGangsPlayerStatus();

    //daily task. will triggered at midnight.
    dailyCornJob.start();
  } else {
    return;
  }
});

//for prefix command/message  handle
client.on("messageCreate", (message) => {
  //
  // checking is message author bot or not?
  if (message.author.bot) return;
  else {
    //
    // handling prefix command with this function on message/command create.
    CommandsHandel(message);
  }
});

//for slash command handle
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  else {
    //
    // handling slash command.
    interactionHandle(interaction);
  }
});

client.login(process.env.APP_TOKEN);
export default client;

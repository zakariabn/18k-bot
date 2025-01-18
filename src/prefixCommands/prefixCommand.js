import { startWordRemove } from "../Component/functionsComponent.js";
import sendPlayersInfo from "./command/players.js";
import { sendPlayerInfo, sendPlayerDetailInfo } from "./command/player.js";
import auth from "../auth/authentication.js";
import clearChannelMessage from "./command/clear.js";

const COMMANDS = {
  help: {
    execute: (message) =>
      message.channel
        .send(
          "If you want to send a message by bot, use -send followed by your message."
        )
        .then(() => message.delete())
        .catch(console.error),
    requiredAccessLevel: 1, // Minimum access level required for this command
  },
  player: {
    execute: sendPlayerInfo,
    requiredAccessLevel: 1,
  },
  "d-player": {
    execute: sendPlayerDetailInfo,
    requiredAccessLevel: 2, // Example: higher level needed
  },
  players: {
    execute: sendPlayersInfo,
    requiredAccessLevel: 2,
  },
  send: {
    execute: (message) =>
      message.channel
        .send(startWordRemove(message.content))
        .then(() => message.delete())
        .catch(console.error),
    requiredAccessLevel: 4,
  },
  clear: {
    execute: clearChannelMessage,
    requiredAccessLevel: 4,
  },
};

export default async function CommandsHandel(message) {
  const prefix = "-";

  if (!message.content.startsWith(prefix)) return;

  // Check user authorization and access level
  const { isUserAuthorized, accessLevel } = await auth(message);

  if (!isUserAuthorized) {
    // User is not authorized
    console.log("User is not authorized");
    message.channel.send("You are not authorized!");

    setTimeout(async () => {
      await message.channel.bulkDelete(1);
    }, 3000);

    return;
  }

  // Extract command
  const commandName = message.content
    .slice(prefix.length)
    .split(" ")[0]
    .toLowerCase();

  const command = COMMANDS[commandName];

  if (!command) {
    // Invalid command
    message.channel
      .send("This is not a valid command!")
      .then(() => message.delete())
      .catch(console.error);
    return;
  }

  // Check if the user's access level allows the command
  if (accessLevel >= command.requiredAccessLevel) {
    console.log(`Executing command: ${commandName}`);
    command.execute(message);
  } else {
    message.channel.send(
      `You don't have access to the ${commandName} command.`
    );

    setTimeout(async () => {
      await message.channel.bulkDelete(1);
    }, 3000);
  }
}

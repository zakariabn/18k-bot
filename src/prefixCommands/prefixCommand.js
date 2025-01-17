import { startWordRemove } from "../Component/functionsComponent.js";
import sendPlayersInfo from "./command/players.js";
import { sendPlayerInfo, sendPlayerDetailInfo } from "./command/player.js";
import auth from "../auth/authentication.js";
import clearChannelMessage from "./command/clear.js";

export default async function CommandsHandel(message) {
  const prefix = "-";

  if (message.content.startsWith(prefix)) {
    // checking this user is authorized or not.
    const authorizedUser = await auth(message);

    if (!authorizedUser) {
      message.channel.send("You are not authorized!");

      //deleting unauthorized send data
      setTimeout(async () => {
        await message.channel.bulkDelete(1);
      }, 3000);
    } else {
      //prefix command extracting (-)
      const command = message.content
        .slice(prefix.length)
        .split(" ")[0]
        .toLowerCase();

      switch (command) {
        case "send":
          message.channel
            .send(startWordRemove(message.content))
            .then(() => message.delete()) // Deletes the user's message
            .catch(console.error);
          break;

        case "help":
          message.channel
            .send(
              "If you want to send a message by bot, use -send followed by your message."
            )
            .then(() => message.delete()) // Deletes the user's message
            .catch(console.error);
          break;

        case "clear":
          //
          //clearing server channel message [-clear 20] this will clear 20.
          clearChannelMessage(message);
          break;

        case "player":
          //
          //sending single player information
          sendPlayerInfo(message);
          break;

        case "d-player":
          //
          //sending single player information
          // sendPlayerDetailInfo(message);
          break;

        case "players":
          //
          // sending all players information
          sendPlayersInfo(message);
          break;

        default:
          message.channel
            .send("This is not a valid command!")
            .then(() => message.delete()) // Deletes the user's message
            .catch(console.error);
          break;
      }
    }
  }
}

import { startWordRemove } from "../../Component/functionsComponent.js";

const authorizedUsers = ["its_poloo", "lordv0ld3m0rtyt"];

export default function clearChannelMessage(message) {
  //
  //
  if (authorizedUsers.includes(message.author.name)) {
    try {
      const count = parseInt(startWordRemove(message.content));
      if (/^[0-9]+$/.test(count)) {
        message.channel.bulkDelete(count + 1); // Deletes the specified count + the user's message
      } else {
      }
    } catch (error) {
      console.log(error);
    }
  }
}

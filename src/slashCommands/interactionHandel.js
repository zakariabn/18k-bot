import auth from "../auth/authentication.js";
import handlingDischarge from "./interaction/discharge.js";
import HandlingLink from "./interaction/link.js";
import handlingPromotion from "./interaction/promotion.js";
import handlingSend from "./interaction/send.js";
import handlingRosterUpdate from "./interaction/update-roster.js";

const COMMANDS = {
  link: {
    execute: HandlingLink,
    requiredAccessLevel: 1,
  },
  send: {
    execute: handlingSend,
    requiredAccessLevel: 4,
  },
  promotion: {
    execute: handlingPromotion,
    requiredAccessLevel: 4,
  },
  discharge: {
    execute: handlingDischarge,
    requiredAccessLevel: 4,
  },
  "update-roster": {
    execute: handlingRosterUpdate,
    requiredAccessLevel: 4,
  },
};

export default async function interactionHandle(interaction) {
  const { commandName, channel } = interaction;

  const { isUserAuthorized, accessLevel } = await auth(interaction);

  /*
  Access Levels:
    1: Basic commands only
    2: (Reserved for additional commands)
    3: (Reserved for additional commands)
    4: Full access, including database manipulation
  */

  if (!isUserAuthorized) {
    interaction.reply({
      content: "You are not an authorized member.",
      ephemeral: true,
    });
    return;
  }

  const command = COMMANDS[commandName];

  if (!command) {
    interaction.reply({
      content: "Invalid command.",
      ephemeral: true,
    });
    return;
  }

  if (accessLevel >= command.requiredAccessLevel) {
    try {
      command.execute(interaction);
    } catch (error) {
      console.error(`Error executing command '${commandName}':`, error);
      interaction.reply({
        content: `An error occurred while executing the command.`,
        ephemeral: true,
      });
    }
  } else {
    interaction.reply({
      content: "You don't have access to this command.",
      ephemeral: true,
    });
  }
}

import auth from "../auth/authentication.js";
import handlingDischarge from "./interaction/discharge.js";
import HandlingLink from "./interaction/link.js";
import handlingPromotion from "./interaction/promotion.js";
import handlingSend from "./interaction/send.js";
import handlingRosterUpdate from "./interaction/update-roster.js";

export default async function interactionHandle(interaction) {
  const { commandName, options, channel } = interaction;

  const isAuthorized = await auth(interaction);

  if (!isAuthorized) {
    interaction.reply({
      content: "You are not an authorized member.",
      ephemeral: true,
    });
  } else {
    switch (commandName) {
      case "link":
        HandlingLink();
        break;

      case "send":
        handlingSend(interaction);
        break;

      case "promotion":
        handlingPromotion();

      case "discharge":
        handlingDischarge(interaction);
        break;

      case "update-roster":
        handlingRosterUpdate(interaction);
        break;

      default:
        break;
    }
  }
}

import { JSONFilePreset } from "lowdb/node";

//setup tax database
const defaultTaxEntry = { last_tax_code: 0, taxes: [{}] };
const taxDB = await JSONFilePreset("DB/turfTax.json", defaultTaxEntry);

//setup member/roster database
const defaultRosterEntry = { members: [{}] };
const rosterDB = await JSONFilePreset("DB/members.json", defaultRosterEntry);

//setup playerTimers database
const defaultPlayersTimeEntry = { playerTimers: {} };
const playersTimeDB = await JSONFilePreset(
  "DB/playerTimers.json",
  defaultPlayersTimeEntry
);

//exporting database........
export { taxDB, rosterDB, playersTimeDB };

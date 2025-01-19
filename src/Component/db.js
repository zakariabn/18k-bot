import { JSONFilePreset } from "lowdb/node";

//setup tax database
const defaultTaxEntry = {
  tax_id: "",
  payer_name: "",
  b_name: "",
  valid: "",
  expired_date: "",
  due: "",
  paid: "",
  collector: { name: "", id: "" },
  nid: "",
  status: "",
};
const taxDB = await JSONFilePreset("DB/turfTax.json", defaultTaxEntry);

//setup member/roster database
const defaultRosterEntry = {
  members: {
    discord_user_id: "",
    real_name: "",
    role: "",
    role_history: {
      role: "",
      date: "2000-01-01",
    },
  },
};
const rosterDB = await JSONFilePreset("DB/members.json", defaultRosterEntry);

//exporting database........
export { taxDB, rosterDB };

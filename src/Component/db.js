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

export { taxDB };

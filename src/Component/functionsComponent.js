function startWordRemove(message) {
  const extractMessageArray = message.split(" ");
  const splitMessage = [];

  for (let a = 1; a <= extractMessageArray.length; a++) {
    if (extractMessageArray[a] != undefined) {
      splitMessage.push(extractMessageArray[a]);
    }
  }
  return splitMessage.join(" ");
}

async function FetchingServerData() {
  const baseURL = "https://servers-frontend.fivem.net/api/servers/single/";
  const endPointHalka = "galpex";
  const endPointBPR = "dp56ed";
  const endPointSecretCityBG = "43q6yo";
  const testServer = "yjbqg5";
  const newServer = "54gbk7";
  const newServer2 = "brplk8";

  // const data = await fetch(baseURL + endPointHalka)
  const data = await fetch(baseURL + endPointHalka)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if (!data) {
        return "data not found";
      } else {
        for (let start = 0; data?.Data?.players?.length > start; start++) {
          data.Data.players[start].uniqId = start + 1;
        }
        return data;
      }
    })
    .catch((error) => {
      console.log("Fetch Error :", error);
    });
  return data;
}

export { startWordRemove, FetchingServerData };

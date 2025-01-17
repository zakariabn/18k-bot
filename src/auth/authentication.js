const authorizedRoleIds = [
  { serverName: "18k sins", authRoleId: "1306285331158667306" },
  { serverName: "testServer", authRoleId: "1306896047909638204" },
];

async function checkUserRole(response) {
  let isUserAuthorized = false;
  try {
    const member = response?.member;

    //roleIds is a array. so looping this array for each authorize roles.
    for (let roleId of authorizedRoleIds) {
      //
      if (member.roles.cache.has(roleId?.authRoleId)) {
        return (isUserAuthorized = true);
      }
    }
  } catch (error) {
    console.error("Error checking user role:", error);
  }
  return isUserAuthorized;
}

export default async function auth(response) {
  let isAuthorized = false;

  if (await checkUserRole(response)) {
    isAuthorized = true;
  }

  return isAuthorized;
}

const authorizedRoleIds = [
  {
    serverName: "18k sins",
    authRoleId: [
      { name: "18k bot access", id: "1306285331158667306", access_level: 4 },
      { name: "the 18k sins", id: "1131652913643651092", access_level: 1 },
    ],
  },
  {
    serverName: "testServer",
    authRoleId: [
      { name: "18k bot access", id: "1306896047909638204", access_level: 4 },
      { name: "the 18k sis", id: "1330289156852551692", access_level: 1 },
    ],
  },
];

async function checkUserRole(response) {
  let isUserAuthorized = false;
  let accessLevel = null; // Set to null if no access level is found

  try {
    const member = response?.member;
    const userAccessLevels = [];

    // Loop through all authorized roles for each server
    for (let roleGroup of authorizedRoleIds) {
      for (let role of roleGroup.authRoleId) {
        if (member?.roles?.cache.has(role.id)) {
          userAccessLevels.push(role.access_level); // Collect the access levels for roles the user has
        }
      }
    }

    if (userAccessLevels.length > 0) {
      isUserAuthorized = true;
      accessLevel = Math.max(...userAccessLevels); // Get the highest access level among user roles
    }
  } catch (error) {
    console.error("Error checking user role:", error);
  }

  return {
    isUserAuthorized,
    accessLevel,
  };
}

export default async function auth(response) {
  return checkUserRole(response);
}

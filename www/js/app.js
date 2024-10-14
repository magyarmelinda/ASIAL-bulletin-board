document.addEventListener("DOMContentLoaded", (e) => {
  const applicationKey = "**********"; // Configure the application key here
  const clientKey = "**********"; // Configure the client key here
  window.ncmb = new NCMB(applicationKey, clientKey);
});

ons.ready(async () => {
  // Get the data of the currently logged-in user
  let user = ncmb.User.getCurrentUser();
  // If a user exists, the login process is performed
  if (user) {
    try {
      // It will attempt to retrieve data from the appropriate data store
      // Checks if the session is valid
      await ncmb.DataStore("Test").fetch();
    } catch (e) {
      // In case of an error, such as session expiration or deletion of user data
      // User data will be deleted, and anonymous authentication will be performed
      user = null;
    }
  }
  // If there is no user data, perform anonymous authentication
  if (!user) {
    user = await ncmb.User.loginAsAnonymous();
  }

  // After authentication:
  // Retrieve the admin group
  const role = await ncmb.Role.equalTo("roleName", "admin").fetch();
  // Retrieve the users group
  const users = await role.fetchUser();
  // If you have your object ID, it means you are an admin.
  window.admin = users.map((u) => u.objectId).indexOf(user.objectId) > -1;
});

function loadImage(name, className) {
  if (!this.querySelector(className)) return;
  ncmb.File.download(name, "blob").then((blob) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      this.querySelector(className).src = fileReader.result;
    };
    fileReader.readAsDataURL(blob);
  });
}

// Function to determine if the item can be deleted
function deletable(obj) {
  let bol = false;
  // Admins can always delete
  if (window.admin) {
    bol = true;
  } else {
    // If you are not an admin, check if you have delete permissions
    const user = ncmb.User.getCurrentUser();
    bol = user && obj.acl[user.objectId] && obj.acl[user.objectId].write;
  }
  // Show the trash icon if the item is deletable
  return bol
    ? `<ons-icon data-object-id="${obj.objectId}" class="delete" icon="fa-trash"></ons-icon>`
    : "";
}

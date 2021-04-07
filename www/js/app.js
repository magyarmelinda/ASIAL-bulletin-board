document.addEventListener('DOMContentLoaded', e => {
  const applicationKey = '**********';
  const clientKey = '**********';
  window.ncmb = new NCMB(applicationKey, clientKey);
})

ons.ready(async () => {
  // get the currently logged in user data
  let user = ncmb.User.getCurrentUser();
  // if there is a user = logging in is performed
  if (user) {
    try {
      // it will try to get the data of the appropriate data store
      // checks if the session is valid
      await ncmb.DataStore('Test').fetch();
    } catch (e) {
      // in case of error: session expired, user data has been deleted, etc.
      // user data will be deleted and an anonymous authentication is performed
      user = null;
    }
  }
  // if there is no user data, perform anonymous authentication
  if (!user) {
    user = await ncmb.User.loginAsAnonymous();
  }

  // after authetication:
  // get the admin group
  const role = await ncmb.Role.equalTo('roleName', 'admin').fetch();
  // get the users group
  const users = await role.fetchUser();
  // if you have your objectID, it means your an admin
  window.admin = users.map(u => u.objectId).indexOf(user.objectId) > -1;
});


function loadImage(name, className) {
  if (!this.querySelector(className)) return;
  ncmb.File.download(name, 'blob')
    .then(blob => {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        this.querySelector(className).src = fileReader.result;
      }
      fileReader.readAsDataURL(blob) ;
    })
}

// function to determine if it can be deleted
function deletable(obj) {
  let bol = false;
  // admins can always delete
  if (window.admin) {
    bol = true;
  } else {
    // if you are not an admin, check if you have delete permission
    const user = ncmb.User.getCurrentUser();
    bol = user && obj.acl[user.objectId] && obj.acl[user.objectId].write;
  }
  // show trash can icon if deleteable
  return bol ? `<ons-icon data-object-id="${obj.objectId}" class="delete" icon="fa-trash"></ons-icon>` : '';
}

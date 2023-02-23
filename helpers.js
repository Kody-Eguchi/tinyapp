//generateRandomString function
const generateRandomString = function() {
  let result = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

//returns the URLs where the userID is equal to the id of the currently logged-in user
const urlsForUser = function(id, database) {
  let filteredDatabase = {};
  for (const [urlID, urlObj] of Object.entries(database)) {
    if (urlObj.userID === id) {
      filteredDatabase[urlID] = urlObj;
    }
  }
  return filteredDatabase;
};

//Helper Function: getUserByEmail()
const getUserByEmail = function(email, database) {
  let user = {};
  for (const id in database) {
    if (database[id].email !== email) {
      user =  {err: `User Not Found`, user: null};
    }

    if (database[id].email === email) {
      user = { err: null, user:database[id]};
    }
  }
  return user;
};

module.exports = {generateRandomString, urlsForUser, getUserByEmail};
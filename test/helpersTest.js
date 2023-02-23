const { assert } = require('chai');

const {urlsForUser, getUserByEmail} = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('---TEST: getUserByEmail---', function() {
  it('should return a user with valid email', function() {
    const {user} = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID);
  });

  it('should return null with invalid email', function() {
    const {user} = getUserByEmail("wrong@example.com", testUsers);
    assert.isNull(user);
  });
});


const testDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

describe('---TEST: urlsForUser---', function() {
  it('should return filtered database with userID of "aJ48lW"', function() {
    const filteredUrlObj = urlsForUser("aJ48lW", testDatabase);
    const keyArr = Object.keys(filteredUrlObj);
    assert.equal(filteredUrlObj[keyArr[0]].userID, "aJ48lW");
  });

});



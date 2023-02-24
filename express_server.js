/* eslint-disable camelcase */
const express = require('express');
const app = express();
const PORT = 8080;
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');

//IMPORT
const {generateRandomString, urlsForUser, getUserByEmail} = require("./helpers");

/*----------Middelwares----------*/
//Parse request.body to human readable
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['user_id'],
  maxAge: 24 * 60 * 60 * 1000
}));
app.use(methodOverride('_method'));

/*----------Databases----------*/
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

/*----------Routes----------*/
app.get('/', (req, res) => {
  res.send(`Hello!`);
});

// Get a JSON data for urlDatabase
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Render /urls page
app.get('/urls', (req, res) => {
  //⬇️When sending variables to an EJS template, we need to send them inside an object, even if we are only sending one variable. This is so we can use the key of that variable (in the above case the key is urls) to access the data within our template.
  const userId = req.session.user_id;
  if (!userId) {
    return res.send('create an user account/login to use URL shortener');
  }
  const filteredDatabase = urlsForUser(userId, urlDatabase);
  const templateVars = {
    urls: filteredDatabase,
    user: users[userId]
  };
  res.render("urls_index", templateVars);
});

//Render /urls/new page
app.get('/urls/new', (req, res) => {
  const userId = req.session.user_id;
  const templateVars = {
    user: users[userId]
  };
  res.render("urls_new", templateVars);
});

//⬇️WThe end point for such a page will be in the format /urls/:id. The : in front of id indicates that id is a route parameter. This means that the value in this part of the url will be available in the req.params object.
app.get('/urls/:id', (req, res) => {
  const userId = req.session.user_id;
  const {id} = req.params;
  if (!urlDatabase[id]) {
    return res.send("<html><body>Error 404: Page Not Found - URL You Entered Does Not Exist</body></html>\n");
  }
  if (urlDatabase[id].userID !== userId) {
    return res.send("<html><body>Error 404: Page Can Not Be Accessed - You Are Not Authorized to Access This Page</body></html>\n");
  }
  const {longURL} = urlDatabase[id];
  const templateVars = {
    id,
    longURL,
    user: users[userId]
  };
  res.render("urls_show", templateVars);
});

//Generate a shortened URL and create a key-value pair
app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.send('create an user account/login to use URL shortener');
  }
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL]["longURL"] = req.body.longURL;
  urlDatabase[shortURL]["userID"] = userId;
  res.redirect(`/urls/${shortURL}`);
});

//Get a value from a form input
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const {longURL} = urlDatabase[shortURL];
  res.redirect(longURL);
});

//Get a Post request to remove a URL
app.delete("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  const {id} = req.params;
  if (urlDatabase[id].userID !== userId) {
    return res.send("<html><body>Error 404: You Cannot Delete An URL Created by Others</body></html>\n");
  }
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

//Edit a long URL
app.put('/urls/:id', (req, res) => {
  const userId = req.session.user_id;
  const {id} = req.params;
  if (urlDatabase[id].userID !== userId) {
    return res.send("<html><body>Error 404: You Cannot Edit An URL Created by Others</body></html>\n");
  }
  const newLongURL = req.body.longURL;
  for (let shortURL in urlDatabase) {
    if (shortURL === id) {
      urlDatabase[shortURL].longURL = newLongURL;
    }
  }
  res.redirect(`/urls/${id}`);
});

//Creat /login endpoint
app.get('/login', (req, res) => {
  const userId = req.session.user_id;
  const templateVars = {
    user: users[userId]
  };
  res.render("urls_login", templateVars);
});

//Submit a authentication info (email, password) via login
app.post('/login', (req, res) => {
  const {email, password} = req.body;
  const {err, user} = getUserByEmail(email, users);
  
  if (err) {
    return res.send("<html><body>Error: 403 - user authentication failed</html></body>");
  }
  const passwordCheck = bcrypt.compareSync(password, user.password);
  if (!passwordCheck) {
    return res.send("<html><body>Error: 403 - user authentication failed</html></body>");
  }

  const {id} = user;
  req.session.user_id = id;
  return res.redirect('/urls');
});

//Delete a cookie upon logout
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

//Create /register endpint
app.get('/register', (req, res) => {
  const userId = req.session.user_id;
  const templateVars = {
    user: users[userId]
  };
  res.render("urls_register", templateVars);
});

//Submit a new registration (email+password)
app.post('/register', (req, res) => {
  const id = generateRandomString();
  const {email, password} = req.body;
  if (!email || !password) {
    return res.send('error: 400');
  }
  const {err} = getUserByEmail(email, users);
  if (err) {
    users[id] = {
      id,
      email,
      password: bcrypt.hashSync(password, 10),
    };
    req.session.user_id = id;
    return res.redirect('/urls');
  }
  res.send(`Error: 400 - a user with this email addres already exist `);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


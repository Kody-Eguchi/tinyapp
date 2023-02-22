const express = require('express');
const app = express();
const PORT = 8080;

//Parse values from the cookies
const cookieParser = require('cookie-parser');
const e = require('express');

//Parse request.body to human readable
app.use(express.urlencoded({ extended: true }));
 
//generateRandomString function
const generateRandomString = function() {
  let result = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
};

//Setting up EJS
app.set("view engine", "ejs");
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

app.get('/', (req, res) => {
  res.send(`Hello!`);
});

//Get a JSON data for urlDatabase
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//Render /urls page
app.get('/urls', (req, res) => {
  //⬇️When sending variables to an EJS template, we need to send them inside an object, even if we are only sending one variable. This is so we can use the key of that variable (in the above case the key is urls) to access the data within our template.
  const userId = req.cookies.user_id;
  const templateVars = {
    urls: urlDatabase,
    user: users[userId]
  };
  res.render("urls_index", templateVars);
});

//Render /urls/new page
app.get('/urls/new', (req, res) => {
  const userId = req.cookies.user_id;
  const templateVars = {
    user: users[userId]
  };
  res.render("urls_new", templateVars);
});

//⬇️WThe end point for such a page will be in the format /urls/:id. The : in front of id indicates that id is a route parameter. This means that the value in this part of the url will be available in the req.params object.
app.get('/urls/:id', (req, res) => {
  const userId = req.cookies.user_id;
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[userId]
  };
  res.render("urls_show", templateVars);
});

//Generate a shortened URL and create a key-value pair
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

//Get a value from a form input
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

//Get a Post request to remove a URL
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

//Edit a long URL
app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.longURL;
  for (let shortURL in urlDatabase) {
    if (shortURL === id) {
      urlDatabase[shortURL] = newLongURL;
    }
  }
  res.redirect(`/urls/${id}`);
});

//Creat /login endpoint
app.get('/login', (req, res) => {
  const userId = req.cookies.user_id;
  const templateVars = {
    user: users[userId]
  };
  res.render("urls_login", templateVars);
});

//Submit a username for login
app.post('/login', (req, res) => {
  const {email, password} = req.body;
  console.log(email, password);
  // res.cookie("username", username);
  res.redirect('/urls');
});

//Delete a cookie and logout
app.post('/logout', (req, res) => {
  // const username = req.body.username;
  res.clearCookie('username');
  res.redirect('/urls');
});

//Create /register endpint
app.get('/register', (req, res) => {
  const templateVars = {
    user: null,
  };
  res.render("urls_register", templateVars);
});

//Helper Function: getUserByEmail()
const getUserByEmail = function(email) {
  let result = {};
  for (const i in users) {
    if (users[i].email !== email) {
      result =  {err: `User Not Found`, user: null};
    }

    if (users[i].email === email) {
      result = { err: null, user:users[i]};
    }
  }
  // console.log(result);
  return result;
};

//Submit a new registration (username+password)
app.post('/register', (req, res) => {
  const id = generateRandomString();
  const {email, password} = req.body;

  if (!email || !password) {
    return res.send('error: 400');
  }

  const {err, user} = getUserByEmail(email);

  if (err) {
    users[id] = {
      id,
      email,
      password
    };

    res.cookie("user_id", id);
    return res.redirect('/urls');
  }

  res.send(`Error: 400 - a user with this email addres already exist `);

});


// app.get('/400', (req, res) => {
//   res.send(`404 Page Not Found`);
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


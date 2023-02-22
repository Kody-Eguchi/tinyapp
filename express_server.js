const express = require('express');
const app = express();
const PORT = 8080;

//Parse values from the cookies
const cookieParser = require('cookie-parser');

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

app.get('/', (req, res) => {
  res.send(`Hello!`);
});

//Get a JSON data
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//Render /urls page
app.get('/urls', (req, res) => {
  //⬇️When sending variables to an EJS template, we need to send them inside an object, even if we are only sending one variable. This is so we can use the key of that variable (in the above case the key is urls) to access the data within our template.
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"],
  };
  res.render("urls_index", templateVars);
});

//Render /urls/new page
app.get('/urls/new', (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  };
  res.render("urls_new", templateVars);
});

//⬇️WThe end point for such a page will be in the format /urls/:id. The : in front of id indicates that id is a route parameter. This means that the value in this part of the url will be available in the req.params object.
app.get('/urls/:id', (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"]
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

//Submit a username for login
app.post('/login', (req, res) => {
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect('/urls');
});

//Delete a cookie and logout
app.post('/logout', (req, res) => {
  // const username = req.body.username;
  res.clearCookie('username');
  res.redirect('/urls');
});

//Create a /register endpint
app.get('/register', (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  };
  res.render("urls_register", templateVars);
});


// app.get('*', (req, res) => {
//   res.send(`404 Page Not Found`);
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


const express = require('express');
const app = express();
const PORT = 8080;

//Setting up EJS
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/', (req, res) => {
  res.send(`Hello!`);
});

app.get(`/urls.json`, (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get('/urls', (req, res) => {
  //⬇️When sending variables to an EJS template, we need to send them inside an object, even if we are only sending one variable. This is so we can use the key of that variable (in the above case the key is urls) to access the data within our template.
  const templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars);
});

//⬇️WThe end point for such a page will be in the format /urls/:id. The : in front of id indicates that id is a route parameter. This means that the value in this part of the url will be available in the req.params object.
app.get('/urls/:id', (req, res) => {
  const templateVars = {id: req.params.id, longURL: req.params.urls};
  res.render("urls_show", templateVars);
});

// app.get('*', (req, res) => {
//   res.send(`404 Page Not Found`);
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


const express = require("express");
const users = new Set();

const logger = (req, res, next) => {
  console.log(req.method, req.path);
  next();
};

const serveHomePage = (req, res) => {
  res.sendFile(process.env.PWD + "/pages/index.html");
  console.log(req.cookies);
};

const serveLoginPage = (req, res) => {
  res.sendFile(process.env.PWD + "/pages/login.html");
};

const loginUser = (req, res) => {
  const { username } = req.body;
  users.add(username);
  res.cookie("username", username).redirect("/");
};

const sendUsers = (req, res) => {
  res.json([...users]);
};

const createApp = () => {
  const app = express();

  app.use(logger);
  app.use(express.urlencoded({ extended: true }));
  app.get("/", serveHomePage);
  app.get("/users", sendUsers);
  app.get("/login", serveLoginPage);
  app.post("/login", loginUser);

  return app;
};

const main = () => {
  const app = createApp();
  const port = 8080;

  app.listen(port, () => {
    console.log("listening on:", port);
  });
};

main();

const express = require("express");
const { sendUsers, addUser } = require("./handlers/users");
const { consoleLogger } = require("./middleware/logger");

const setupApp = (users) => {
  const app = new express();
  app.users = users;

  app.use(consoleLogger);
  app.use(express.json());
  app.get("/users", sendUsers);
  app.post("/users", addUser);

  return app;
};

module.exports = { setupApp };

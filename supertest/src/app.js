const express = require("express");
const { sendUsers, addUser } = require("./handlers/users");

const createApp = (users) => {
  const app = new express();
  app.users = users;

  app.use(express.json());
  app.get("/users", sendUsers);
  app.post("/users", addUser);
  
  return app;
};

module.exports = { createApp };

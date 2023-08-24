const express = require("express");
const { sendUsers } = require("./handlers/users");

const createApp = (users) => {
  const app = new express();
  app.users = users;

  app.get("/users", sendUsers);
  
  return app;
};

module.exports = { createApp };

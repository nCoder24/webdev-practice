const express = require("express");

const createApp = () => {
  const app = new express();

  app.get("/", (_req, res) => {
    res.send("<h1>Hello</h1>");
  });
  
  return app;
};

module.exports = { createApp };

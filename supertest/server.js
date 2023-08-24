const express = require("express");

const serveHome = (req, res) => {
  res.send("<h1>Hello</h1>");
};

const createApp = () => {
  const app = new express();
  app.get("/", serveHome);
  return app;
};

const main = () => {
  const port = 8080;
  const app = createApp();
  app.listen(port, () => {
    console.log("listening on:", port);
  });
};

main();

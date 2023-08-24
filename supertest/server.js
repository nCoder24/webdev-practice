const express = require("express");
const { createApp } = require("./src/app");

const main = () => {
  const port = 8080;
  const app = createApp();
  app.listen(port, () => {
    console.log("listening on:", port);
  });
};

main();

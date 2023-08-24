const { createApp } = require("./src/app");

const main = () => {
  const port = 8080;
  const app = createApp(new Set());
  
  app.listen(port, () => {
    console.log("listening on:", port);
  });
};

main();

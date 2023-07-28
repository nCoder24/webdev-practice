const { Socket } = require("node:net");

const client = new Socket();

client.on("connect", () => {
  console.log("Connected To Server!");

  client.on("data", (data) => {
    console.log(`server: ${data}`);
  });

  client.write("Hello This Is Client");
});

client.connect(8080);

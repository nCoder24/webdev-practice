const { Server } = require("node:net");
const server = new Server();

server.on("connection", (socket) => {
  console.log("New Connection!");

  socket.on("data", (data) => {
    console.log(`client: ${data}`);
  });
  socket.write("Hello This is Server");
});

server.listen(8080, () => console.log("Started Listening!"));

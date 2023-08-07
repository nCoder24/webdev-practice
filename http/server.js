const { Server } = require("node:net");
const { HttpServer } = require("./http-server");

const main = () => {
  const app = new HttpServer(new Server());

  app.registerHandler("/", (req, res) => {
    res.body("home");
    res.end();
  });

  app.registerHandler("/ping", (req, res) => {
    res.body("pong");
    res.end();
  });

  app.registerHandler("/echo", (req, res) => {
    res.body("echo");
    res.end();
  });

  app.registerHandler("/echo/*", (req, res) => {
    res.body(req.uri.match(/\/echo\/(.*)/));
    res.end();
  });

  app.registerDefaultHandler(({ uri }, res) => {
    res.status(404);
    res.body(`${uri} not found`);
    res.end();
  });

  app.registerBadRequestHandler((req, res) => {
    res.body("bad request");
    res.status(400);
    res.end();
  });

  app.registerInvalidRequestHandler((req, res) => {
    res.body("method not allowed");
    res.status(405);
    res.end();
  });

  app.start(8000);
};

main();

const { Server } = require("node:net");
const { HttpServer } = require("./http-server");

const serveHomePage = (req, res) => {
  res.body("home");
  res.end();
};

const servePingPage = (req, res) => {
  res.body("pong");
  res.end();
};

const serveEchoHomePage = (req, res) => {
  res.body("echo");
  res.end();
};

const serveEchoChildPage = (req, res) => {
  const [, content] = req.uri.match(/\/echo\/(.*)/);
  res.body(content);
  res.end();
};

const responseNotFoundError = ({ uri }, res) => {
  res.status(404);
  res.body(`${uri} not found`);
  res.end();
};

const responseBadRequest = (req, res) => {
  res.body("bad request");
  res.status(400);
  res.end();
};

const responseInvalidRequest = (req, res) => {
  res.body("method not allowed");
  res.status(405);
  res.end();
};

const validator = (req, res) => {
  if (req.protocol !== "HTTP/1.1" || !("user-agent" in req.headers)) {
    responseBadRequest(req, res);
    return false;
  }

  if (req.method !== "GET") {
    responseInvalidRequest(req, res);
    return false;
  }

  return true;
};

const main = () => {
  const app = new HttpServer(new Server());

  app.registerHandler("/", serveHomePage);
  app.registerHandler("/ping", servePingPage);
  app.registerHandler("/echo", serveEchoHomePage);
  app.registerHandler("/echo/.*", serveEchoChildPage);
  app.registerHandler(".*", responseNotFoundError);
  app.registerValidator(validator);

  app.start(8000);
};

main();

const http = require("node:http");
const Router = require("./router");
const fs = require("node:fs");
const MIME_TYPES = {
  plain: "text/plain",
  html: "text/html",
};

const log = ({ method, url }) => console.log(method, url);

const serveHomePage = (req, res) => {
  fs.readFile("public/index.html", (error, content) => {
    if (error) {
      res.writeHead(500);
      res.end("Internal Error");
      return;
    }

    res.writeHead(200, MIME_TYPES.html);
    res.end(content);
  });
};

const respondNotFound = (req, res) => {
  res.writeHead(404, { "content-type": MIME_TYPES.plain });
  res.end(`${req.url} not found`);
};

const serveSearchResult = (req, res) => {
  res.end(req.params.get("query"));
};

const main = () => {
  const port = 8000;
  const router = new Router();
  const server = http.createServer((req, res) => {
    log(req);
    router.route(req, res);
  });

  router.registerHandler("/", serveHomePage);
  router.registerHandler("/search?.*", serveSearchResult);
  router.registerHandler("/.*", respondNotFound);

  server.listen(port, () => console.log("listening on:", port));
};

main();

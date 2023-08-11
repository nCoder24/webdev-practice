const { HttpResponse } = require("./http-response");

const parseHttpRequest = (requestText) => {
  const [requestLine, ...headersTexts] = requestText.trim().split("\r\n");

  const headers = Object.fromEntries(
    headersTexts.map((headerText) => {
      const [key, value] = headerText.split(":");
      return [key.trim().toLowerCase(), value.trim()];
    })
  );

  const [method, uri, protocol] = requestLine.trim().split(" ");
  return { method, uri, protocol, headers };
};

class HttpServer {
  #tcpServer;
  #handlers;

  constructor(server) {
    this.#tcpServer = server;
    this.#handlers = [];
  }

  #handle(request, response) {
    const matchPattern = ({ pattern }) => pattern.test(request.uri);
    const handlers = this.#handlers.filter(matchPattern).values();

    const next = () => {
      const handler = handlers.next().value;
      if (handler) {
        handler.callback(request, response, next);
      }
    };

    next();
  }

  start(port) {
    this.#tcpServer.on("connection", (socket) => {
      socket.setEncoding("utf-8");
      socket.on("data", (httpRequest) => {
        const request = parseHttpRequest(httpRequest);
        const response = new HttpResponse(socket);

        this.#handle(request, response);
      });
    });

    this.#tcpServer.listen(port, () => {
      console.log("started at:", port);
    });
  }

  registerHandler(pattern, callback) {
    this.#handlers.push({
      pattern: new RegExp(`^${pattern}$`),
      callback,
    });
  }
}

module.exports = { HttpServer };

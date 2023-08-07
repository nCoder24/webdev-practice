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
  #validator;

  constructor(server) {
    this.#tcpServer = server;
    this.#handlers = [];
  }

  #handle(request, response) {
    const matchPattern = ({ uriPattern }) => uriPattern.test(request.uri);

    const isValid = this.#validator(request, response);
    if (!isValid) return;

    const handler = this.#handlers.find(matchPattern);
    handler.callback(request, response);
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

  registerHandler(uriPattern, callback) {
    this.#handlers.push({
      uriPattern: new RegExp(`^${uriPattern}$`),
      callback,
    });
  }

  registerValidator(validator) {
    this.#validator = validator;
  }
}

module.exports = { HttpServer };

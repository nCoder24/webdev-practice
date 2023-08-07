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
  #defaultHandler;
  #badRequestHandler;
  #invalidMethodHandler;

  constructor(server) {
    this.#tcpServer = server;
    this.#handlers = [];
  }

  #validate(request, response) {
    if (request.protocol !== "HTTP/1.1" || !("user-agent" in request.headers)) {
      this.#badRequestHandler(request, response);
      return false;
    }

    if (request.method !== "GET") {
      this.#invalidMethodHandler(request, response);
      return false;
    }

    return true;
  }

  #handle(request, response) {
    const isValid = this.#validate(request, response);
    if (!isValid) return;

    const matchPattern = ({ uriPattern }) => {
      return request.uri.match(new RegExp(`^${uriPattern}$`));
    };

    const handler = this.#handlers.find(matchPattern);

    if (handler) {
      handler.callback(request, response);
      return;
    }

    this.#defaultHandler(request, response);
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
    this.#handlers.push({ uriPattern, callback });
  }

  registerDefaultHandler(handler) {
    this.#defaultHandler = handler;
  }

  registerBadRequestHandler(handler) {
    this.#badRequestHandler = handler;
  }

  registerInvalidRequestHandler(handler) {
    this.#invalidMethodHandler = handler;
  }
}

module.exports = { HttpServer };

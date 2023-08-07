const { Server } = require("node:net");

const RESULTS = {
  200: "OK",
  404: "NOT_FOUND",
  400: "BAD_REQUEST",
  405: "METHOD_NOT_FOUND",
};

const parseHttpRequest = (request) => {
  const [requestLine, headers] = request.trim().split("\n");
  const [method, uri, protocol] = requestLine.trim().split(" ");

  return { method, uri, protocol };
};

const generateHttpResponse = ({
  protocol = "HTTP/1.1",
  statusCode = 200,
  body,
}) => {
  const result = RESULTS[statusCode];
  const statusLine = [protocol, statusCode, result].join(" ");
  return [statusLine, body].join("\n\n");
};

class HttpServer {
  #tcp;
  #handlers;
  #defaultHandler;
  #badRequestHandler;
  #invalidMethodHandler;

  constructor(server) {
    this.#tcp = server;
    this.#handlers = [];
  }

  #validate(request) {
    if (request.protocol !== "HTTP/1.1") {
      return this.#badRequestHandler(request);
    }

    if (request.method !== "GET") {
      return this.#invalidMethodHandler(request);
    }

    return null;
  }

  #handle(request) {
    const response = this.#validate(request);
    if (response) return response;

    const matchPattern = ({ uriPattern }) =>
      request.uri.match(new RegExp(`^${uriPattern}$`));

    const handler = this.#handlers.find(matchPattern);

    return handler ? handler.callback(request) : this.#defaultHandler(request);
  }

  start(port) {
    this.#tcp.on("connection", (socket) => {
      socket.setEncoding("utf-8");
      socket.on("data", (httpRequest) => {
        const response = this.#handle(parseHttpRequest(httpRequest));
        socket.write(generateHttpResponse(response));
        socket.end();
      });
    });

    this.#tcp.listen(port, () => {
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

const main = () => {
  const app = new HttpServer(new Server());

  app.registerHandler("/ping", () => ({ body: "pong" }));
  app.registerHandler("/echo/.*", ({ uri }) => {
    const [_, content] = uri.match(/\/echo\/(.*)/);
    return {
      body: content,
    };
  });

  app.registerHandler("/echo", () => {
    return {
      body: "echo",
    };
  });

  app.registerHandler("/", () => ({ body: "home" }));

  app.registerDefaultHandler(({ uri }) => ({
    body: `${uri} not found`,
    statusCode: 404,
  }));

  app.registerBadRequestHandler(() => ({
    body: "bad request",
    statusCode: 400,
  }));

  app.registerInvalidRequestHandler(() => ({
    body: "method not allowed",
    statusCode: 405,
  }));

  app.start(8000);
};

main();

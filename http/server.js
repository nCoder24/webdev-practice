const { Server } = require("node:net");

const RESULTS = {
  200: "OK",
  404: "NOT_FOUND",
  400: "BAD_REQUEST",
  405: "METHOD_NOT_FOUND",
};

const parseHttpRequest = (request) => {
  const [requestLine, ...headersTexts] = request.trim().split("\r\n");
  const headers = Object.fromEntries(
    headersTexts.map((headerText) => {
      const [key, value] = headerText.split(":");
      return [key.trim().toLowerCase(), value.trim()];
    })
  );

  const [method, uri, protocol] = requestLine.trim().split(" ");

  return { method, uri, protocol, headers };
};

const generateHttpResponse = ({
  protocol = "HTTP/1.1",
  statusCode = 200,
  content = "",
  headers = {},
}) => {
  const result = RESULTS[statusCode];
  const statusLine = [protocol, statusCode, result].join(" ");

  const primaryHeaders = {
    date: new Date().toGMTString(),
    "content-length": content.length,
  };

  const headerLines = Object.entries({ ...primaryHeaders, ...headers })
    .map((header) => header.join(": ") + "\r\n")
    .join("");

  return `${statusLine}\n${headerLines}\n${content}`;
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
    if (request.protocol !== "HTTP/1.1" || !("user-agent" in request.headers)) {
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

  app.registerHandler("/", () => ({ content: "home" }));
  app.registerHandler("/ping", () => ({ content: "pong" }));
  app.registerHandler("/echo", () => ({ content: "echo" }));
  app.registerHandler("/echo/.*", ({ uri }) => {
    const [, content] = uri.match(/\/echo\/(.*)/);
    return { content };
  });

  app.registerDefaultHandler(({ uri }) => ({
    content: `${uri} not found`,
    statusCode: 404,
  }));

  app.registerBadRequestHandler(() => ({
    content: "bad request",
    statusCode: 400,
  }));

  app.registerInvalidRequestHandler(() => ({
    content: "method not allowed",
    statusCode: 405,
  }));

  app.start(8000);
};

main();

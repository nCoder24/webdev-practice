const RESULTS = {
  200: "OK",
  404: "NOT_FOUND",
  400: "BAD_REQUEST",
  405: "METHOD_NOT_FOUND",
};

class HttpResponse {
  #socket;
  #protocol;
  #status;
  #body;
  #headers;

  constructor(socket) {
    this.#socket = socket;
    this.#protocol = "HTTP/1.1";
    this.#status = { code: 200, message: "OK" };
    this.#body = "";
    this.#headers = {};
  }

  #generateResponse() {
    const statusLine = [
      this.#protocol,
      this.#status.code,
      this.#status.message,
    ].join(" ");

    const primaryHeaders = {
      date: new Date().toGMTString(),
      "content-length": this.#body.length,
    };

    const headerLines = Object.entries({ ...primaryHeaders, ...this.#headers })
      .map((header) => header.join(": ") + "\r\n")
      .join("");

    return `${statusLine}\n${headerLines}\n${this.#body}`;
  }

  body(content) {
    this.#body = content;
  }

  status(code) {
    this.#status = { code, message: RESULTS[code] };
  }

  end() {
    this.#socket.write(this.#generateResponse());
    this.#socket.end();
  }
}

module.exports = { HttpResponse };

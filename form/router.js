class Router {
  #handlers;

  constructor() {
    this.#handlers = [];
  }

  route(req, res) {
    const matchPattern = ({ pattern }) => pattern.test(req.url);
    const handlers = this.#handlers.filter(matchPattern).values();

    const next = () => {
      const handler = handlers.next().value;
      if (!handler) return;
      req.params = new URLSearchParams(req.url.split("?")[1]);
      handler.callback(req, res, next);
    };

    next();
  }

  registerHandler(pattern, callback) {
    this.#handlers.push({
      pattern: new RegExp(`^${pattern}$`),
      callback,
    });
  }
}

module.exports = Router;

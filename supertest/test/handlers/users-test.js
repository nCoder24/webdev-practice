const request = require("supertest");
const { describe, it } = require("node:test");
const { createApp } = require("../../src/app");

const MIME_TYPES = {
  json: new RegExp("application/json"),
};

describe("Users", () => {
  describe("GET /users", () => {
    it("should get the users", (_, done) => {
      const users = new Set(["utsab", "raj"]);
      const app = createApp(users);
      request(app)
        .get("/users")
        .expect(200)
        .expect("content-type", MIME_TYPES.json)
        .expect([...users])
        .end(done);
    });
  });
});

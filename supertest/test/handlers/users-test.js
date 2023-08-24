const request = require("supertest");
const { describe, it } = require("node:test");
const { setupApp } = require("../../src/app");
const assert = require("assert");
const { AssertionError } = require("assert");

const MIME_TYPES = {
  json: new RegExp("application/json"),
};

describe("Users", () => {
  describe("GET /users", () => {
    it("should get the users", (_, done) => {
      const users = new Set(["utsab", "raj"]);
      const app = setupApp(users);
      request(app)
        .get("/users")
        .expect(200)
        .expect("content-type", MIME_TYPES.json)
        .expect([...users])
        .end(done);
    });
  });

  describe("POST /users", () => {
    it("should add the users", (_, done) => {
      const users = new Set();
      const app = setupApp(users);
      request(app)
        .post("/users")
        .send({username: "raj"})
        .expect(201)
        .end(() => {
          assert.deepStrictEqual([...users], ["raj"]);
          done();
        });
    });
  });
});

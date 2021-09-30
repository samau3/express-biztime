"use strict";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testCompany, testInvoice1, testInvoice2;

beforeEach(async function () {
  await db.query("DELETE FROM companies");
  await db.query("DELETE FROM invoices");

  const results = await db.query(`
    INSERT INTO companies (name, description)
    VALUES ('Test', 'tst')
    RETURNING id`);
  testUser = results.rows[0];

  await db.query(`
    INSERT INTO tags
    VALUES ('py', 'Python'),
           ('js', 'JavaScript')`);

  const mResults = await db.query(`
    INSERT INTO messages (user_id, msg)
    VALUES ($1, 'Hello'),
           ($1, 'Goodbye')
    RETURNING id`, [testUser.id]);
  testMsg1 = mResults.rows[0];
  testMsg2 = mResults.rows[1];

  await db.query(`
    INSERT INTO messages_tags
    VALUES ($1, 'py'),
           ($1, 'js'),
           ($2, 'py')`, [testMsg1.id, testMsg2.id]);
});

test("GET /messages/:id", async function () {
  const resp = await request(app).get(`/messages/${testMsg1.id}`);
  expect(resp.body).toEqual({
    message: {
      id: testMsg1.id, msg: "Hello", tags: ["JavaScript", "Python"],
    },
  });
});

test("PUT /messages/:id", async function () {
  const resp = await request(app)
      .put(`/messages/${testMsg1.id}`)
      .send({ msg: "T" });
  expect(resp.body).toEqual({
    message: { id: testMsg1.id, user_id: testUser.id, msg: "T" },
  });
});

test("PUT /messages/v2/:id", async function () {
  const resp = await request(app)
      .put(`/messages/${testMsg1.id}`)
      .send({ msg: "T" });
  expect(resp.body).toEqual({
    message: { id: testMsg1.id, user_id: testUser.id, msg: "T" },
  });
});

test("PUT /messages/v2/:id", async function () {
  const resp = await request(app)
      .put(`/messages/v2/0`)
      .send({ msg: "T" });
  expect(resp.status).toEqual(404);
});

afterAll(async function () {
  await db.end();
});

"use strict";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testCompany, testInvoice1, testInvoice2;

beforeEach(async function () {
    await db.query("DELETE FROM companies");
    await db.query("DELETE FROM invoices");

    const companyResults = await db.query(
        `INSERT INTO companies (code, name, description)
        VALUES (rithm, Rithm School, Maker of software engineers.)
        RETURNING code, name, description`,);
    testCompany = companyResults.rows[0];

    const invoiceResults = await db.query(
        `INSERT INTO invoices (comp_code, amt)
            VALUES  (rithm, 24000),
                    (rithm, 200)
            RETURNING id, comp_code, amt, paid, add_date, paid_date`);
    testInvoice1 = invoiceResults.rows[0];
    testInvoice2 = invoiceResults.rows[1];
});

test("GET /companies/:id", async function () {
    const resp = await request(app).get(`/companies/rithm`);
    expect(resp.body).toEqual({
        message: {
            id: testMsg1.id, msg: "Hello", tags: ["JavaScript", "Python"],
        },
    });
});

test("PUT /companies/:id", async function () {
    const resp = await request(app)
        .put(`/companies/${testMsg1.id}`)
        .send({ msg: "T" });
    expect(resp.body).toEqual({
        message: { id: testMsg1.id, user_id: testUser.id, msg: "T" },
    });
});

test("PUT /companies/v2/:id", async function () {
    const resp = await request(app)
        .put(`/companies/${testMsg1.id}`)
        .send({ msg: "T" });
    expect(resp.body).toEqual({
        message: { id: testMsg1.id, user_id: testUser.id, msg: "T" },
    });
});

test("PUT /companies/v2/:id", async function () {
    const resp = await request(app)
        .put(`/companies/v2/0`)
        .send({ msg: "T" });
    expect(resp.status).toEqual(404);
});

afterAll(async function () {
    await db.end();
});

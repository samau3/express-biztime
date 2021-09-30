"use strict";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testCompany, testInvoice1, testInvoice2;

beforeEach(async function () {
    await db.query("DELETE FROM companies");
    await db.query("DELETE FROM invoices");
    // console.log('in beforeEach')

    const companyResults = await db.query(
        `INSERT INTO companies (code, name, description)
            VALUES ('rithm', 'Rithm School', 'Maker of software engineers.')
        RETURNING code, name, description`,);
    testCompany = companyResults.rows[0];
    const invoiceResults = await db.query(
        `INSERT INTO invoices (comp_code, amt)
            VALUES  ('rithm', 24000),
                    ('rithm', 200)
            RETURNING id, comp_code, amt, paid, paid_date`);
    // testInvoice1 = invoiceResults.rows[0];
    // testInvoice2 = invoiceResults.rows[1];
    // console.log('at end of beforeEa')
});

test("GET /companies/:id", async function () {
    const resp = await request(app).get(`/companies/rithm`);
    // console.log("in get", resp.body)
    expect(resp.body).toEqual({
        company: {
            code: "rithm",
            name: "Rithm School",
            description: "Maker of software engineers.",
            invoices: [
                {
                    id: expect.any(Number),
                    amt: "24000.00",
                    paid: false,
                    add_date: expect.anything(),
                    paid_date: null
                },
                {
                    id: expect.any(Number),
                    amt: "200.00",
                    paid: false,
                    add_date: expect.anything(),
                    paid_date: null
                }
            ]
        }
    });
});

// test("PUT /companies/:id", async function () {
//     const resp = await request(app)
//         .put(`/companies/${testMsg1.id}`)
//         .send({ msg: "T" });
//     expect(resp.body).toEqual({
//         message: { id: testMsg1.id, user_id: testUser.id, msg: "T" },
//     });
// });

// test("PUT /companies/v2/:id", async function () {
//     const resp = await request(app)
//         .put(`/companies/${testMsg1.id}`)
//         .send({ msg: "T" });
//     expect(resp.body).toEqual({
//         message: { id: testMsg1.id, user_id: testUser.id, msg: "T" },
//     });
// });

// test("PUT /companies/v2/:id", async function () {
//     const resp = await request(app)
//         .put(`/companies/v2/0`)
//         .send({ msg: "T" });
//     expect(resp.status).toEqual(404);
// });

afterAll(async function () {
    await db.end();
});

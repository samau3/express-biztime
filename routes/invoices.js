"use strict";
/** Routes about invoices. */

const express = require("express");
const { NotFoundError, BadRequestError } = require("../expressError");

const router = new express.Router();
const db = require("../db");


/** GET / - returns array of all invoices `{invoices: [{id, comp_code}, ...]}` */

router.get("/", async function (req, res, next) {
    const results = await db.query(
        `SELECT id, comp_code 
            FROM invoices
            ORDER BY id`
    );
    const invoices = results.rows;

    return res.json({ invoices });
});


/** GET /[id] - return data about one invoice: 
 * {
 *      invoice: {id, amt, paid, add_date, paid_date, 
 *          company: {code, name, description}
 *      }
 * }
 */

router.get("/:id", async function (req, res, next) {
    const id = req.params.id;
    const invoiceResults = await db.query(
        `SELECT id, comp_code, amt, paid, add_date, paid_date 
            FROM invoices 
            WHERE id = $1`,
        [id]
    );
    const code = invoiceResults.rows[0].comp_code;
    const invoice = invoiceResults.rows[0];
    delete invoice.comp_code;

    const companyResults = await db.query(
        `SELECT code, name, description 
            FROM companies 
            WHERE code = $1
            `,
        [code]);
    const company = companyResults.rows[0];

    if (!invoice) throw new NotFoundError(`No matching invoice: ${id}`);
    invoice.company = company;
    return res.json({ invoice });
});


/** POST / - create invoice from data formatted like below:
  *    {comp_code, amt} 
  * return `{
  *     invoice: 
  *         {id, comp_code, amt, paid, add_date, paid_date}
  * }` 
  * */
router.post("/", async function (req, res, next) {
    const { comp_code, amt } = req.body;
    const results = await db.query(
        `INSERT INTO invoices (comp_code, amt)
            VALUES ($1, $2)
            RETURNING id, comp_code, amt, paid, add_date, paid_date`,
        [comp_code, amt]);
    const invoice = results.rows[0];

    return res.status(201).json({ invoice });
});


/** PUT /[id] - update name and description in a invoice; 
 * return `{invoice: {id, name, description}}` 
 */

router.put("/:id", async function (req, res, next) {
    if ("id" in req.body) throw new BadRequestError("Not allowed");

    const id = req.params.id;
    const amt = req.body.amt;
    const results = await db.query(
        `UPDATE invoices
            SET amt = $1
            WHERE id = $2
            RETURNING id, comp_code, amt, paid, add_date, paid_date`,
        [amt, id]);
    const invoice = results.rows[0];

    if (!invoice) throw new NotFoundError(`No matching invoice: ${id}`);
    return res.json({ invoice });
});


/** DELETE /[id] - delete a invoice, return `{status: "deleted"}` */

router.delete("/:id", async function (req, res, next) {
    const id = req.params.id;
    const results = await db.query(
        `DELETE FROM invoices 
            WHERE id = $1 
            RETURNING id`,
        [id]
    );
    const invoice = results.rows[0];

    if (!invoice) throw new NotFoundError(`No matching invoice: ${id}`);
    return res.json({ status: "deleted" });
});


module.exports = router;
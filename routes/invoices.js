"use strict";
/** Routes about invoices. */

const express = require("express");
const { NotFoundError, BadRequestError } = require("../expressError");

const router = new express.Router();
const db = require("../db");


/** GET / - returns array of all invoices `{invoices: [{id, comp_code}, ...]}` */

router.get("/", async function (req, res, next) {
    const results = await db.query("SELECT id, comp_code FROM invoices");
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
        "SELECT id, code, amt, paid, add_date, paid_date FROM invoices WHERE id = $1", [id]);
    const code = results.row[0].code;
    const invoice = results.rows[0];
    delete invoice.code;

    const companyResults = await db.query(
        "SELECT code, name, description FROM company WHERE id = $1", [id]);
    const invoice = results.rows[0];

    if (!invoice) throw new NotFoundError(`No matching invoice: ${id}`);
    return res.json({ invoice });
});


/** POST / - create invoice from data formatted like below:
  *    {id, name, description} 
  * return `{invoice: {id, name, description}}` */
router.post("/", async function (req, res, next) {
    const results = await db.query(
        `INSERT INTO invoices (id, name, description)
         VALUES ($1, $2, $3)
         RETURNING id, name, description`,
        [req.body.id, req.body.name, req.body.description]);
    const invoice = results.rows[0];

    return res.status(201).json({ invoice });
});


/** PUT /[id] - update name and description in a invoice; 
 * return `{invoice: {id, name, description}}` 
 */

router.put("/:id", async function (req, res, next) {
    if ("id" in req.body) throw new BadRequestError("Not allowed");

    const id = req.params.id;
    const results = await db.query(
        `UPDATE invoices
         SET name= $1, description = $2
         WHERE id = $3
         RETURNING name, description`,
        [req.body.name, req.body.description, id]);
    const invoice = results.rows[0];

    if (!invoice) throw new NotFoundError(`No matching invoice: ${id}`);
    return res.json({ invoice });
});


/** DELETE /[id] - delete a invoice, return `{status: "deleted"}` */

router.delete("/:id", async function (req, res, next) {
    const id = req.params.id;
    const results = await db.query(
        "DELETE FROM invoices WHERE id = $1 RETURNING id", [id]);
    const invoice = results.rows[0];

    if (!invoice) throw new NotFoundError(`No matching invoice: ${id}`);
    return res.json({ status: "deleted" });
});


module.exports = router;
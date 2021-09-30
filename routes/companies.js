"use strict";
/** Routes about cats. */

const express = require("express");
const { NotFoundError, BadRequestError } = require("../expressError");

const router = new express.Router();
const db = require("../db");


/** GET / - returns `{companies: [{code, name}, ...]}` */

router.get("/", async function (req, res, next) {
  const results = await db.query("SELECT code, name FROM companies");
  const companies = results.rows;

  return res.json({ companies });
});


/** GET /[code] - return data about one company: `{company: {code, name, description}}` */

router.get("/:code", async function (req, res, next) {
  const code = req.params.code;
  const results = await db.query(
    "SELECT code, name, description FROM companies WHERE code = $1", [code]);
  const company = results.rows[0];

  if (!company) throw new NotFoundError(`No matching company: ${code}`);
  return res.json({ company });
});


/** POST / - create company from data formatted like below:
    * {code, name, description} 
 * return `{company: {code, name, description}}` */

router.post("/", async function (req, res, next) {
  const results = await db.query(
    `INSERT INTO cats (name)
         VALUES ($1)
         RETURNING id, name`,
    [req.body.name]);
  const cat = results.rows[0];

  return res.status(201).json({ cat });
});


/** Put /[code] - update fields in company; return `{company: {code, name, description}}` */

router.put("/:id", async function (req, res, next) {
  if ("id" in req.body) throw new BadRequestError("Not allowed");

  const id = req.params.id;
  const results = await db.query(
    `UPDATE cats
         SET name=$1
         WHERE id = $2
         RETURNING id, name`,
    [req.body.name, id]);
  const cat = results.rows[0];

  if (!cat) throw new NotFoundError(`No matching cat: ${id}`);
  return res.json({ cat });
});


/** DELETE /[code] - delete company, return `{status: "deleted"}` */

router.delete("/:id", async function (req, res, next) {
  const id = req.params.id;
  const results = await db.query(
    "DELETE FROM cats WHERE id = $1 RETURNING id", [id]);
  const cat = results.rows[0];

  if (!cat) throw new NotFoundError(`No matching cat: ${id}`);
  return res.json({ message: "Cat deleted" });
});


module.exports = router;
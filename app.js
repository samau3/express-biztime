"use strict";
/** BizTime express application. */

const express = require("express");

const app = express();
const companyRoutes = require("./routes/companies");
const invoiceRoutes = require("./routes/invoices");

const { NotFoundError } = require("./expressError");

app.use(express.json());

// ROUTES
app.use("/companies", companyRoutes);
app.use("/invoices", invoiceRoutes);

// ERROR HANDLERS
/** 404 handler: matches unmatched routes; raises NotFoundError. */
app.use(function (req, res, next) {
  return next(new NotFoundError());
});

/** Error handler: logs stacktrace and returns JSON error message. */
app.use(function (err, req, res, next) {
  const status = err.status || 500;
  const message = err.message;
  if (process.env.NODE_ENV !== "test") console.error(status, err.stack);
  return res.status(status).json({ error: { message, status } });
});



module.exports = app;

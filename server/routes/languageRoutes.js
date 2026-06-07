const express = require("express");
const router = express.Router();

const supportedLocales = ["en", "ar"];

router.get("/:locale", (req, res) => {
  const { locale } = req.params;

  if (supportedLocales.includes(locale)) {
    req.session.locale = locale;
  }

  res.redirect(req.get("Referrer") || "/");
});

module.exports = router;
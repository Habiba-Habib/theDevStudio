const path = require("path");
const i18n = require("i18n");

const supportedLocales = ["en", "ar"];

i18n.configure({
  locales: supportedLocales,
  defaultLocale: "en",
  directory: path.join(__dirname, "../locales"),
  objectNotation: true,
  updateFiles: false,
  syncFiles: false
});

function localization(req, res, next) {
  i18n.init(req, res, () => {
    const selectedLocale = req.session.locale || "en";

    req.setLocale(selectedLocale);

    res.locals.__ = res.__;
    res.locals.locale = selectedLocale;
    res.locals.isRTL = selectedLocale === "ar";

    next();
  });
}

module.exports = localization;
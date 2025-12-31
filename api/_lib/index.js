const http = require("./http");
const env = require("./env");
const auth = require("./auth");

module.exports = { ...http, ...env, ...auth };
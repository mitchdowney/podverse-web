"use strict";

module.exports = {
  port: process.env.PORT || 9000,
  baseURL: process.env.baseURL || 'http://localhost:9000',
  apiSecret: 'wide-open',
  nedbFolder: process.env.nedbFolder || __dirname
};

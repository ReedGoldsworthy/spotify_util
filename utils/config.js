require("dotenv").config();

const MONGODB_URI =
  process.env.NODE_ENV === "test"
    ? process.env.TEST_MONGODB_URI
    : process.env.MONGODB_URI;
let PORT = process.env.PORT || 3001;
let CLIENT_ID = process.env.CLIENT_ID;
let CLIENT_SECRET = process.env.CLIENT_SECRET;
let ACCESS_TOKEN = null;

module.exports = {
  MONGODB_URI,
  PORT,
  CLIENT_ID,
  CLIENT_SECRET,
  ACCESS_TOKEN,
};

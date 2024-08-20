const express = require("express");
const querystring = require("querystring");
const config = require("../utils/config"); // Spotify credentials
const logger = require("../utils/logger");

const loginRouter = express.Router();

//this route
loginRouter.get("/", (req, res) => {
  const scope =
    "user-read-private user-read-email,user-read-private,user-read-email,playlist-read-private,playlist-modify-public, playlist-modify-private,user-library-read,";
  const authorizationUrl =
    "http://accounts.spotify.com/authorize?" +
    querystring.stringify({
      response_type: "code",
      client_id: config.CLIENT_ID,
      scope: scope,
      // redirect_uri: `http://localhost:${config.PORT}/callback`, // Your frontend redirect URI
      redirect_uri: `https://spotify-util.onrender.com/callback`, // Your frontend redirect URI for render
      show_dialog: true,
    });

  res.redirect(authorizationUrl);
});

module.exports = loginRouter;

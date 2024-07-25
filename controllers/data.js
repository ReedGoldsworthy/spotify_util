const dataRouter = require("express").Router();
const axios = require("axios");
const Playlist = require("../models/playlist");
const User = require("../models/user");
const Song = require("../models/song");

dataRouter.get("/tracks", async (req, res) => {
  const { playlistID } = req.query; // Accessing the playlistID query parameter
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ error: "Access token is missing" });
  }
  const accessToken = authHeader.split(" ")[1];
  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/playlists/${playlistID}/tracks`,
      {
        headers: {
          Authorization: `Bea rer ${accessToken}`,
        },
      }
    );
    res.json(response.data.items);
  } catch (error) {
    res.status(500).json("problem is in getting tracks");
  }
});

dataRouter.get("/songs", async (req, res) => {
  const { playlistID } = req.query; // Accessing the playlistID query parameter
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ error: "Access token is missing" });
  }
  const accessToken = authHeader.split(" ")[1];
  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/me/playlists`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    res.json(response.data.items);
  } catch (error) {
    res.status(500).json("problem is in getting songs");
  }
});

dataRouter.get("/playlist", async (req, res) => {
  Playlist.find({}).then((playlist) => {
    res.json(playlist);
  });
});

module.exports = dataRouter;

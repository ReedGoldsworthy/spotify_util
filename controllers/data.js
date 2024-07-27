const dataRouter = require("express").Router();
const axios = require("axios");
const Playlist = require("../models/playlist");
const User = require("../models/user");
const Song = require("../models/song");

dataRouter.get("/playlist", async (req, res) => {
  Playlist.find({}).then((playlist) => {
    res.json(playlist);
  });
});

dataRouter.get("/playlist/:id", async (req, res) => {
  try {
    const playlist = await Playlist.findOne({ spotifyId: req.params.id });
    if (playlist) {
      res.json(playlist);
    } else {
      res.status(404).send("Playlist not found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

// change this to return a list of all the playlist tracks, then use that response to set data in frontned
dataRouter.get("/playlist/:id/tracks", async (req, res) => {
  try {
    const playlist = await Playlist.findOne({
      spotifyId: req.params.id,
    }).populate("tracks");
    if (playlist) {
      res.json(playlist.tracks);
    } else {
      res.status(404).send("Playlist not found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

dataRouter.get("/songs", async (req, res) => {
  Song.find({}).then((song) => {
    res.json(song);
  });
});

module.exports = dataRouter;

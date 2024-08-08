const dataRouter = require("express").Router();
const axios = require("axios");
const Playlist = require("../models/playlist");
const User = require("../models/user");
const Song = require("../models/song");

const { saveTracks } = require("../services/songService");

const {
  getArtists,
  getYears,
  getGenres,
} = require("../services/playlistService");

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

// This route takes a user & playlist ID and returns the tracks associated with that user's playlist from the DB.
// if the playlist has not been saved yet, it will process and save the playlist tracks into the DB.
dataRouter.get("/:userID/playlist/:id/tracks", async (req, res) => {
  try {
    const { userID, id } = req.params;

    //check whether playlist already exists in the DB & populate the tracks array
    const playlist = await Playlist.findOne({
      spotifyId: id,
    }).populate("tracks");

    //return tracks if playlist tracks are already populated
    if (playlist && playlist.tracks.length > 0) {
      res.json(playlist.tracks);

      //else save playlist tracks into DB
    } else if (playlist) {
      const user = await User.findOne({ displayName: userID });

      if (user) {
        //save all playlist tracks into DB and update Playlist in our DB
        playlist.tracks = await saveTracks(id, user.accessToken);
        await playlist.save();

        // Populate tracks in the returned playlist
        const populatedPlaylist = await Playlist.findById(
          playlist._id
        ).populate("tracks");

        res.json(populatedPlaylist.tracks);
        //Save the specified playlist to the DB
      } else {
        res.status(404).send("User not found");
      }
    } else {
      res.status(404).send("invalid Playlist");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error saving playlist");
  }
});

dataRouter.get("/songs", async (req, res) => {
  Song.find({}).then((song) => {
    res.json(song);
  });
});

dataRouter.get("/:userID/playlist/:id/info", async (req, res) => {
  try {
    const { userID, id } = req.params;

    // const result = await getArtists(userID, id);
    const playlist = await Playlist.findOne({
      spotifyId: id,
    });

    const years = await getYears(id);
    const artists = await getArtists(id);
    const genres = await getGenres(id);

    const result = {
      numTracks: playlist.tracks.length,
      numArtists: artists.length,
      years: years,
      artists: artists,
      genres: genres,
    };

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error getting playlist stats");
  }
});

module.exports = dataRouter;

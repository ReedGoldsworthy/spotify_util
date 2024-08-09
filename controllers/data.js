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
  getAttributes,
} = require("../services/playlistService");

//this route returns all playlists from our DB, might want to specify a user to get playlists from in future
dataRouter.get("/playlist", async (req, res) => {
  Playlist.find({}).then((playlist) => {
    res.json(playlist);
  });
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

//this route takes a user and playlist ID and returns the aggregated data for the tracks of that playlist from our DB
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
    const {
      danceability,
      acousticness,
      energy,
      instrumentalness,
      valence,
      averages,
    } = await getAttributes(id);

    const result = {
      numTracks: playlist.tracks.length,
      numArtists: artists.length,
      years: years,
      artists: artists,
      genres: genres,
      danceability: danceability,
      acousticness: acousticness,
      energy: energy,
      instrumentalness: instrumentalness,
      valence: valence,
      averages: averages,
    };

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error getting playlist stats");
  }
});

module.exports = dataRouter;

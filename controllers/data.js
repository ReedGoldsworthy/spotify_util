const dataRouter = require("express").Router();
const axios = require("axios");
const Playlist = require("../models/playlist");
const User = require("../models/user");
const Song = require("../models/song");
const config = require("../utils/config"); // Your Spotify credentials

// gets tracks of a playlist from playlistID and stores tracks into DB
const saveTracks = async (playlistID, token) => {
  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/playlists/${playlistID}/tracks`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const tracks = response.data.items.map((song) => song.track);
    // const songs = tracks.map((track) => track.name);
    const savedSongIDs = [];

    for (let index = 0; index < tracks.length; index++) {
      const track = tracks[index];

      if (!track || !track.id) {
        console.warn(
          `Track at index ${index} is invalid or has a null/undefined spotifyID. Skipping.`
        );
        continue;
      }

      let song = await Song.findOne({ spotifyID: track.id });

      if (!song) {
        const songObject = new Song({
          name: track.name,
          artist: track.artists[0].name,
          album: track.album.name,
          release_date: track.album.release_date,
          // id: index,
          genre: "brat",
          // playlistID: playlistID,
          spotifyID: track.id,
          createdAt: Date.now(), // Add createdAt field
        });

        const savedSong = await songObject.save();
        savedSongIDs.push(savedSong._id); // Add the ID of the saved song to the array
      } else {
        savedSongIDs.push(song._id);
      }
    }

    return savedSongIDs;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch playlist tracks");
  }
};

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

module.exports = dataRouter;

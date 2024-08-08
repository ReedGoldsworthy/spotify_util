const dataRouter = require("express").Router();
const axios = require("axios");
const Playlist = require("../models/playlist");
const User = require("../models/user");
const Song = require("../models/song");
const config = require("../utils/config"); // Your Spotify credentials
const playlist = require("../models/playlist");

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

    const savedSongIDs = [];

    for (let index = 0; index < tracks.length; index++) {
      const track = tracks[index];

      if (!track || !track.id) {
        console.warn(
          `Track at index ${index} is invalid or has a null/undefined spotifyID. Skipping.`
        );
        continue;
      }

      const audioFeatures = await fetchAudioFeatures(token, track.id);
      const currentGenres = await fetchGenres(token, track.artists[0].id);

      let song = await Song.findOne({ spotifyID: track.id });

      if (!song) {
        const songObject = new Song({
          name: track.name,
          artist: track.artists[0].name,
          album: track.album.name,
          release_date: track.album.release_date,
          genres: currentGenres,
          spotifyID: track.id,
          acousticness: audioFeatures.acousticness,
          danceability: audioFeatures.danceability,
          duration: audioFeatures.duration_ms,
          energy: audioFeatures.energy,
          instrumentalness: audioFeatures.instrumentalness,
          valence: audioFeatures.valence,
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

//Function that uses MongoDB aggregate functionality to get the count of each artist in the playlist
const getArtists = async (userID, playlistID) => {
  try {
    const result = await Playlist.aggregate([
      {
        $match: { spotifyId: playlistID },
      },
      {
        $unwind: "$tracks", // Deconstruct the tracks array
      },
      {
        $lookup: {
          from: "songs", // The collection to join
          localField: "tracks", // Field from the playlists collection
          foreignField: "_id", // Field from the songs collection
          as: "songDetails", // Output array field
        },
      },
      {
        $unwind: "$songDetails", // Deconstruct the songDetails array
      },
      {
        $group: {
          _id: "$songDetails.artist", // Group by artist
          count: { $sum: 1 }, // Count occurrences
        },
      },
      {
        $sort: { count: -1 }, // Optional: Sort by count in descending order
      },
    ]);

    return result;
  } catch (error) {
    console.error(error);
    return [];
  }
};

const getYears = async (userID, playlistID) => {
  try {
    const result = await Playlist.aggregate([
      {
        $match: { spotifyId: playlistID },
      },
      {
        $unwind: "$tracks", // Deconstruct the tracks array
      },
      {
        $lookup: {
          from: "songs", // The collection to join
          localField: "tracks", // Field from the playlists collection
          foreignField: "_id", // Field from the songs collection
          as: "songDetails", // Output array field
        },
      },
      {
        $unwind: "$songDetails", // Deconstruct the songDetails array
      },
      {
        $project: {
          releaseYear: {
            $cond: {
              if: {
                $regexMatch: {
                  input: "$songDetails.release_date",
                  regex: /^\d{4}$/,
                },
              },
              then: "$songDetails.release_date",
              else: { $substr: ["$songDetails.release_date", 0, 4] },
            },
          },
        },
      },
      {
        $group: {
          _id: "$releaseYear", // Group by normalized release year
          count: { $sum: 1 }, // Count occurrences
        },
      },
      {
        $addFields: {
          releaseYearNumeric: { $toInt: "$_id" }, // Convert release year to integer for sorting
        },
      },
      {
        $sort: { releaseYearNumeric: 1 }, // Sort by release year in ascending (chronological) order
      },
      {
        $project: {
          _id: 0, // Exclude the original _id field
          releaseYear: "$_id", // Include the release year
          count: 1, // Include the count
        },
      },
    ]);

    return result;
  } catch (error) {
    console.error(error);
    return [0];
  }
};

const getGenres = async (playlistID) => {
  try {
    const result = await Playlist.aggregate([
      {
        $match: { spotifyId: playlistID },
      },

      {
        $lookup: {
          from: "songs",
          localField: "tracks",
          foreignField: "_id",
          as: "songDetails",
        },
      },
      {
        $unwind: "$songDetails",
      },
      {
        $unwind: "$songDetails.genres",
      },

      //Group by genre and count occurrences
      {
        $group: {
          _id: "$songDetails.genres", // Group by genre
          count: { $sum: 1 }, // Count occurrences
        },
      },

      {
        $sort: { count: -1 },
      },
    ]);

    return result;
  } catch (error) {
    console.error(error);
    return [0];
  }
};

const fetchAudioFeatures = async (accessToken, trackID) => {
  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/audio-features/${trackID}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching track audio features:", error);
    throw new Error("Failed to fetch track audio features");
  }
};

const fetchGenres = async (accessToken, artistID) => {
  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/artists/${artistID}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data.genres;
  } catch (error) {
    console.error("Error fetching artist genres:", error);
    throw new Error("Failed to fetch artist genres");
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
    const years = await getYears(userID, id);
    const artists = await getArtists(userID, id);
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

dataRouter.get("/:userID/playlist/genres", async (req, res) => {
  try {
    const { userID } = req.params;
    const user = await User.findOne({ displayName: userID });

    // const response = await axios.get(
    //   `https://api.spotify.com/v1/artists/3TVXtAsR1Inumwj472S9r4`,
    //   {
    //     headers: {
    //       Authorization: `Bearer ${user.accessToken}`,
    //     },
    //   }
    // );

    const response = await fetchAudioFeatures(user.accessToken, "dsadssad");

    // const response = await fetchAudioFeatures(user.accessToken);

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error getting playlist stats");
  }
});

module.exports = dataRouter;

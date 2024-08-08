//helper functions to retrieve playlist Data from our MongoDB Database
const Playlist = require("../models/playlist");

// Function to save a playlist and its songs to the database
const savePlaylist = async (userId, spotifyPlaylist) => {
  const { id, name, description, tracks } = spotifyPlaylist;

  // Create a new playlist if it doesn't exist
  let playlist = new Playlist({
    userId: userId,
    spotifyId: id,
    name: name,
    description: description,
    tracks: [],
    createdAt: Date.now(), // Set the `createdAt` field
  });

  await playlist.save();
};

// Aggregates data to count occurrences of each artist in a playlist from our DB.
const getArtists = async (playlistID) => {
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

//Aggregates data to count occurrences of each release year in a playlist from our DB.
const getYears = async (playlistID) => {
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

//Aggregates data to count occurrences of each genre in a playlist from our DB.
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

module.exports = {
  savePlaylist,
  getArtists,
  getYears,
  getGenres,
};

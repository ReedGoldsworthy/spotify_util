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

//Aggregates data to get the Counts & Average of audio features (i.e Danceability, instrumentallness, Valence, etc...) for a playlist in our DB
const getAttributes = async (playlistID) => {
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
        $project: {
          // Round attributes to the nearest 0.1
          danceability: {
            $round: [{ $multiply: ["$songDetails.danceability", 10] }, 0],
          },
          acousticness: {
            $round: [{ $multiply: ["$songDetails.acousticness", 10] }, 0],
          },
          energy: {
            $round: [{ $multiply: ["$songDetails.energy", 10] }, 0],
          },
          instrumentalness: {
            $round: [{ $multiply: ["$songDetails.instrumentalness", 10] }, 0],
          },
          valence: {
            $round: [{ $multiply: ["$songDetails.valence", 10] }, 0],
          },
        },
      },
      {
        $facet: {
          // Aggregation for counts by rounded values
          danceability: [
            {
              $group: {
                _id: "$danceability", // Group by rounded danceability
                count: { $sum: 1 }, // Count occurrences
              },
            },
            {
              $sort: { _id: 1 }, // Sort by danceability in ascending order
            },
          ],
          acousticness: [
            {
              $group: {
                _id: "$acousticness", // Group by rounded acousticness
                count: { $sum: 1 }, // Count occurrences
              },
            },
            {
              $sort: { _id: 1 }, // Sort by acousticness in ascending order
            },
          ],
          energy: [
            {
              $group: {
                _id: "$energy", // Group by rounded energy
                count: { $sum: 1 }, // Count occurrences
              },
            },
            {
              $sort: { _id: 1 }, // Sort by energy in ascending order
            },
          ],
          instrumentalness: [
            {
              $group: {
                _id: "$instrumentalness", // Group by rounded instrumentalness
                count: { $sum: 1 }, // Count occurrences
              },
            },
            {
              $sort: { _id: 1 }, // Sort by instrumentalness in ascending order
            },
          ],
          valence: [
            {
              $group: {
                _id: "$valence", // Group by rounded valence
                count: { $sum: 1 }, // Count occurrences
              },
            },
            {
              $sort: { _id: 1 }, // Sort by valence in ascending order
            },
          ],
          // Aggregation for overall averages
          averages: [
            {
              $group: {
                _id: null,
                averageDanceability: { $avg: "$danceability" },
                averageAcousticness: { $avg: "$acousticness" },
                averageEnergy: { $avg: "$energy" },
                averageInstrumentalness: { $avg: "$instrumentalness" },
                averageValence: { $avg: "$valence" },
              },
            },
          ],
        },
      },
      {
        $project: {
          danceability: 1,
          acousticness: 1,
          energy: 1,
          instrumentalness: 1,
          valence: 1,
          averages: { $arrayElemAt: ["$averages", 0] }, // Access the averages array
        },
      },
    ]);

    // Access the results
    const danceability = result[0].danceability;
    const acousticness = result[0].acousticness;
    const energy = result[0].energy;
    const instrumentalness = result[0].instrumentalness;
    const valence = result[0].valence;
    const averages = result[0].averages || {}; // Default to empty object if averages are not present

    return {
      danceability,
      acousticness,
      energy,
      instrumentalness,
      valence,
      averages,
    };
  } catch (error) {
    console.error(error);
    return {
      danceability: [],
      acousticness: [],
      energy: [],
      instrumentalness: [],
      valence: [],
      averages: {
        averageDanceability: 0,
        averageAcousticness: 0,
        averageEnergy: 0,
        averageInstrumentalness: 0,
        averageValence: 0,
      },
    };
  }
};

module.exports = {
  savePlaylist,
  getArtists,
  getYears,
  getGenres,
  getAttributes,
};

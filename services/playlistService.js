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

  return playlist;
};

// Aggregates data to count occurrences of each artist in a playlist and get their artist_image from our DB.
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
          _id: {
            artist: "$songDetails.artist",
            artist_image: "$songDetails.artist_image", // Include artist_image in the group by
          },
          count: { $sum: 1 }, // Count occurrences
        },
      },
      {
        $sort: { count: -1 }, // Optional: Sort by count in descending order
      },
      {
        $project: {
          _id: 0,
          artist: "$_id.artist",
          artist_image: "$_id.artist_image",
          count: 1,
        },
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

//This behomoth aggregates data to count occurences of each genre & also groups genres into parent genres to get the parent genre count of a playlist in our DB
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
      {
        $addFields: {
          parentGenre: {
            $switch: {
              branches: [
                // Sub-genre mapping to parent genres
                {
                  case: {
                    $in: [
                      "$songDetails.genres",
                      [
                        "alternative rock",
                        "austindie",
                        "indie rock",
                        "modern rock",
                        "classic rock",
                        "punk rock",
                      ],
                    ],
                  },
                  then: "Rock",
                },
                {
                  case: {
                    $in: [
                      "$songDetails.genres",
                      ["techno", "house", "trance", "dubstep", "drum and bass"],
                    ],
                  },
                  then: "Electronic",
                },
                {
                  case: {
                    $in: [
                      "$songDetails.genres",
                      ["jazz", "smooth jazz", "fusion", "bebop"],
                    ],
                  },
                  then: "Jazz",
                },
                {
                  case: {
                    $in: [
                      "$songDetails.genres",
                      ["pop rock", "dance-pop", "synthpop", "electropop"],
                    ],
                  },
                  then: "Pop",
                },
                {
                  case: {
                    $in: [
                      "$songDetails.genres",
                      ["trap", "conscious rap", "gangsta rap", "boom bap"],
                    ],
                  },
                  then: "Hip-Hop/Rap",
                },
                {
                  case: {
                    $in: [
                      "$songDetails.genres",
                      [
                        "traditional country",
                        "country pop",
                        "bluegrass",
                        "outlaw country",
                      ],
                    ],
                  },
                  then: "Country",
                },
                {
                  case: {
                    $in: [
                      "$songDetails.genres",
                      [
                        "delta blues",
                        "chicago blues",
                        "electric blues",
                        "modern blues",
                      ],
                    ],
                  },
                  then: "Blues",
                },
                {
                  case: {
                    $in: [
                      "$songDetails.genres",
                      ["roots reggae", "dancehall", "dub", "lovers rock"],
                    ],
                  },
                  then: "Reggae",
                },
                {
                  case: {
                    $in: [
                      "$songDetails.genres",
                      [
                        "heavy metal",
                        "thrash metal",
                        "death metal",
                        "black metal",
                      ],
                    ],
                  },
                  then: "Metal",
                },
                {
                  case: {
                    $in: [
                      "$songDetails.genres",
                      ["neo-soul", "classic soul", "modern r&b", "motown"],
                    ],
                  },
                  then: "R&B/Soul",
                },
                {
                  case: {
                    $in: [
                      "$songDetails.genres",
                      [
                        "baroque",
                        "classical",
                        "romantic",
                        "modern classical",
                        "contemporary classical",
                      ],
                    ],
                  },
                  then: "Classical",
                },
                // Regex-based classification for remaining genres
                {
                  case: {
                    $regexMatch: {
                      input: "$songDetails.genres",
                      regex: /rock/i,
                    },
                  },
                  then: "Rock",
                },
                {
                  case: {
                    $regexMatch: {
                      input: "$songDetails.genres",
                      regex: /electronic/i,
                    },
                  },
                  then: "Electronic",
                },
                {
                  case: {
                    $regexMatch: {
                      input: "$songDetails.genres",
                      regex: /jazz/i,
                    },
                  },
                  then: "Jazz",
                },
                {
                  case: {
                    $regexMatch: {
                      input: "$songDetails.genres",
                      regex: /pop/i,
                    },
                  },
                  then: "Pop",
                },
                {
                  case: {
                    $regexMatch: {
                      input: "$songDetails.genres",
                      regex: /hip-hop|rap/i,
                    },
                  },
                  then: "Hip-Hop/Rap",
                },
                {
                  case: {
                    $regexMatch: {
                      input: "$songDetails.genres",
                      regex: /country/i,
                    },
                  },
                  then: "Country",
                },
                {
                  case: {
                    $regexMatch: {
                      input: "$songDetails.genres",
                      regex: /blues/i,
                    },
                  },
                  then: "Blues",
                },
                {
                  case: {
                    $regexMatch: {
                      input: "$songDetails.genres",
                      regex: /reggae/i,
                    },
                  },
                  then: "Reggae",
                },
                {
                  case: {
                    $regexMatch: {
                      input: "$songDetails.genres",
                      regex: /metal/i,
                    },
                  },
                  then: "Metal",
                },
                {
                  case: {
                    $regexMatch: {
                      input: "$songDetails.genres",
                      regex: /r&b|soul/i,
                    },
                  },
                  then: "R&B/Soul",
                },
                {
                  case: {
                    $regexMatch: {
                      input: "$songDetails.genres",
                      regex:
                        /classical|baroque|romantic|modern classical|contemporary classical/i,
                    },
                  },
                  then: "Classical",
                },
              ],
              default: "Other",
            },
          },
        },
      },
      {
        $facet: {
          allGenres: [
            {
              $group: {
                _id: "$songDetails.genres", // Group by individual genre
                count: { $sum: 1 }, // Count occurrences
              },
            },
            {
              $sort: { count: -1 },
            },
          ],
          parentGenres: [
            {
              $group: {
                _id: "$parentGenre", // Group by parent genre
                count: { $sum: 1 }, // Count occurrences
              },
            },
            {
              $sort: { count: -1 },
            },
          ],
        },
      },
    ]);

    // Return the counts of all genres and parent genres
    const parentGenres = result[0].parentGenres;
    const allGenres = result[0].allGenres;
    return { parentGenres, allGenres };
  } catch (error) {
    console.error(error);
    return {
      parentGenres: [],
      allGenres: [],
    };
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
          // Round attributes to the nearest 0.1 or 10
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
          popularity: {
            $round: [{ $divide: ["$songDetails.popularity", 10] }, 0], // Round popularity to nearest 10
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
          popularity: [
            {
              $group: {
                _id: "$popularity", // Group by rounded popularity
                count: { $sum: 1 }, // Count occurrences
              },
            },
            {
              $sort: { _id: 1 }, // Sort by popularity in ascending order
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
                averagePopularity: { $avg: "$popularity" }, // Calculate average popularity
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
          popularity: 1,
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
    const popularity = result[0].popularity;
    const averages = result[0].averages || {}; // Default to empty object if averages are not present

    return {
      danceability,
      acousticness,
      energy,
      instrumentalness,
      valence,
      popularity,
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
      popularity: [],
      averages: {
        averageDanceability: 0,
        averageAcousticness: 0,
        averageEnergy: 0,
        averageInstrumentalness: 0,
        averageValence: 0,
        averagePopularity: 0,
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

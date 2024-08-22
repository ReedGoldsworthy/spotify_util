const initialUsers = [
  {
    spotifyId: "testSpotifyID",
    displayName: "Timmy tester",
    email: "Im over it",
    accessToken: "im still over it",
    refreshToken: null, // You might want to store the refresh token if available
    tokenExpires: null, // You might want to store the token expiration time if available
    createdAt: Date.now(), // Set the creation time
  },
];

const initialPlaylists = [
  {
    userId: "Timmy tester",
    spotifyId: "TesterID1234",
    name: "Chess Music",
    description: "Classical chess playlist",
    tracks: [],
    createdAt: Date.now(), // Set the `createdAt` field
  },
  {
    userId: "Timmy tester",
    spotifyId: "RealRap124553",
    name: "Gym Mix",
    description: "songs to get you hyped",
    tracks: [],
    createdAt: Date.now(), // Set the `createdAt` field
  },
];

const initialSongs = [
  {
    name: "Shape of You",
    artist: "Ed Sheeran",
    album: "÷ (Divide)",
    release_date: "2017-01-06",
    genres: ["pop", "dancehall"],
    spotifyID: "7qiZfU4dY1lWllzX7mPBI3",
    popularity: 85, // Popularity between 0-100
    acousticness: 0.42, // Acousticness between 0.00-1.00
    danceability: 0.82, // Danceability between 0.00-1.00
    duration: 233712, // Duration in milliseconds
    energy: 0.65, // Energy between 0.00-1.00
    instrumentalness: 0.0, // Instrumentalness between 0.00-1.00
    valence: 0.93, // Valence between 0.00-1.00
    artist_image:
      "https://i.scdn.co/image/ab6761610000e5eb4293385d324db8558179afd9", // Example image URL
    createdAt: Date.now(), // Current timestamp
  },

  {
    name: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    release_date: "2019-11-29",
    genres: ["synthpop", "pop"],
    spotifyID: "0VjIjW4GlUZAMYd2vXMi3b",
    popularity: 92, // Popularity between 0-100
    acousticness: 0.13, // Acousticness between 0.00-1.00
    danceability: 0.75, // Danceability between 0.00-1.00
    duration: 200040, // Duration in milliseconds
    energy: 0.73, // Energy between 0.00-1.00
    instrumentalness: 0.0, // Instrumentalness between 0.00-1.00
    valence: 0.74, // Valence between 0.00-1.00
    artist_image:
      "https://i.scdn.co/image/ab6761610000e5eb4293385d324db8558179afd9", // Example image URL
    createdAt: Date.now(), // Current timestamp
  },
];

module.exports = {
  initialPlaylists,
  initialUsers,
  initialSongs,
};

const express = require("express");
const axios = require("axios");
const querystring = require("querystring");
const config = require("../utils/config"); // Your Spotify credentials
const Playlist = require("../models/playlist");
const User = require("../models/user");

// sends GET request with access token to spotify api to get profile data
const fetchSpotifyProfile = async (accessToken) => {
  try {
    const response = await axios.get("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching Spotify profile:", error);
    throw new Error("Failed to fetch Spotify profile");
  }
};

// sends POST request to get access token from spotify API
const getToken = async (code) => {
  try {
    const tokenResponse = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: "http://localhost:3001/callback", // Backend callback URI
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(`${config.CLIENT_ID}:${config.CLIENT_SECRET}`).toString(
              "base64"
            ),
        },
      }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    return access_token;
  } catch (error) {
    console.error("Error getting token", error.response.data);
  }
};

// sends GET request with access token to spotify api to get playlist data
const fetchPlaylists = async (accessToken) => {
  try {
    const response = await axios.get(
      "https://api.spotify.com/v1/me/playlists",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data.items;
    //const songs = response.data.items.map((song) => console.log(song));
  } catch (error) {
    console.error("Error fetching Spotify profile:", error);
    throw new Error("Failed to fetch Spotify profile");
  }
};

// Function to save a playlist and its songs to the database
const savePlaylist = async (userId, spotifyPlaylist) => {
  const { id, name, description, tracks } = spotifyPlaylist;

  // const songs = tracks.items.map((track) => ({
  //   spotifyId: track.track.id,
  //   name: track.track.name,
  //   artist: track.track.artists[0].name,
  //   album: track.track.album.name,
  //   genre: "", // Assuming you fetch genre information separately
  //   releaseYear: new Date(track.track.album.release_date).getFullYear(),
  // }));

  // await saveSongs(songs);

  // playlist.tracks = songs.map((song) => ({ trackId: song._id }));

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

// Checks if user is in MongoDB, if not then adds user & playlists to spotify
const createUser = async (accessToken) => {
  try {
    // Fetch user profile from Spotify using the access token
    const spotifyUser = await fetchSpotifyProfile(accessToken);

    // Check if the user already exists in the database
    let user = await User.findOne({ spotifyId: spotifyUser.id });

    if (user) {
      // User found, return user data

      return user;
    } else {
      // User not found, create a new user in the database
      const newUser = new User({
        spotifyId: spotifyUser.id,
        displayName: spotifyUser.display_name,
        email: spotifyUser.email,
        accessToken: accessToken,
        refreshToken: null, // You might want to store the refresh token if available
        tokenExpires: null, // You might want to store the token expiration time if available
        createdAt: Date.now(), // Set the creation time
      });

      // Save the new user to the database
      user = await newUser.save();

      //save the users playlists and songs into DB

      //get users spotify playlists
      const playlists = await fetchPlaylists(accessToken);

      for (const playlist of playlists) {
        await savePlaylist(user._id, playlist);
      }

      // Return the newly created user data
      return user;
    }
  } catch (error) {
    console.error("Error adding user to db:", error);
    return;
  }
};

const callbackRouter = express.Router();

callbackRouter.get("/", async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).send("No code provided");
  }

  const access_token = await getToken(code);

  try {
    //gets user from DB or stores new user into DB
    const user = await createUser(access_token);

    // Redirect to your frontend with tokens as query parameters
    res.redirect(
      `http://localhost:5173/?user=${user.displayName}&access_token=${access_token}`
    );
  } catch (error) {
    console.error(
      "Error recieving and storing user user in callback:",
      error.response.data
    );
    res.status(500).send("Failed to get access token");
  }
});

module.exports = callbackRouter;

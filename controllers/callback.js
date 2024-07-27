const express = require("express");
const axios = require("axios");
const querystring = require("querystring");
const config = require("../utils/config"); // Your Spotify credentials
const Playlist = require("../models/playlist");
const User = require("../models/user");
const Song = require("../models/song");

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

// Function to save a playlist and its songs to the database
const savePlaylist = async (userId, spotifyPlaylist, token) => {
  const { id, name, description, tracks } = spotifyPlaylist;

  const songs = await saveTracks(id, token);

  // Create a new playlist if it doesn't exist
  let playlist = new Playlist({
    userId: userId,
    spotifyId: id,
    name: name,
    description: description,
    tracks: songs,
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
        await savePlaylist(user._id, playlist, accessToken);
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

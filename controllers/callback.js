const express = require("express");
const axios = require("axios");
const User = require("../models/user");
const {
  fetchSpotifyProfile,
  fetchPlaylists,
  fetchToken,
} = require("../services/spotifyService");

const { savePlaylist } = require("../services/playlistService");

const callbackRouter = express.Router();

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

      //get users spotify playlists for initial display
      const playlists = await fetchPlaylists(accessToken);

      for (const playlist of playlists) {
        await savePlaylist(user._id, playlist);
      }

      //Create and save liked songs playlist
      const likedSongs = {
        description: "All the users liked songs",
        id: "LikedSongs",
        name: "Liked Songs",
      };

      await savePlaylist(user._id, likedSongs);

      // Return the newly created user data
      return user;
    }
  } catch (error) {
    console.error("Error adding user to db:", error);
    return;
  }
};

callbackRouter.get("/", async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).send("No code provided");
  }

  const access_token = await fetchToken(code);

  try {
    //gets user from DB or stores new user into DB
    const user = await createUser(access_token);

    // Redirect to your frontend with tokens as query parameters
    // res.redirect(
    //   `http://localhost:5173/?user=${user.displayName}&access_token=${access_token}`
    // ); // for testing
    res.redirect(
      `https://spotify-util.onrender.com/?user=${user.displayName}&access_token=${access_token}`
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

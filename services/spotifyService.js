//helper functions to interact with spotify API
const axios = require("axios");
const querystring = require("querystring");
const config = require("../utils/config"); // Your Spotify credentials

//fetches Track Audio Features from spotify API
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
    console.error("Error fetching track audio features:", error.message);
    throw new Error("Failed to fetch track audio features");
  }
};

//fetches the Genre list of artistID from spotify API
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
    console.error("Error fetching artist genres:", error.message);
    throw new Error("Failed to fetch artist genres");
  }
};

// sends POST request to get access token from spotify API
const fetchToken = async (code) => {
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
    console.error("Error fetching Spotify token:", error);
    throw new Error("Failed to fetch Spotify token");
  }
};

// sends GET request with access token to spotify API to fetch playlist data
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

// sends GET request with access token to spotify API to fetch profile data
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

module.exports = {
  fetchAudioFeatures,
  fetchGenres,
  fetchPlaylists,
  fetchSpotifyProfile,
  fetchToken,
};

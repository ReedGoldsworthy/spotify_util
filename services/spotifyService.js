//helper functions to interact with spotify API
const axios = require("axios");

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

// sends GET request with access token to spotify api to fetch playlist data
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

// sends GET request with access token to spotify api to fetch profile data
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
};

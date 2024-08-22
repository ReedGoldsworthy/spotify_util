//helper functions to interact with spotify API
const axios = require("axios");
const querystring = require("querystring");
const config = require("../utils/config"); // Your Spotify credentials

// Fetches Track Audio Features from Spotify API
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
    if (error.response && error.response.status === 429) {
      const retryAfter = error.response.headers["retry-after"] || 60;
      console.log(`Rate limited, retrying after ${retryAfter} seconds...`);
      await new Promise((res) => setTimeout(res, retryAfter * 1000));
      return fetchAudioFeatures(accessToken, trackID);
    } else {
      console.error("Error fetching track audio features:", error);
      throw error;
    }
  }
};

// Fetches the genre list and image of an artist from Spotify API
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

    const { genres, images } = response.data;

    // Check if images array is available and has at least one item
    const artistImage =
      images && images.length > 0 ? images[0].url : "default_image_url"; // Use a placeholder image URL or null

    return {
      genres,
      artistImage,
    };
  } catch (error) {
    if (error.response && error.response.status === 429) {
      const retryAfter = error.response.headers["retry-after"] || 50;
      console.log(`Rate limited, retrying after ${retryAfter} seconds...`);
      await new Promise((res) => setTimeout(res, retryAfter * 1000));
      return fetchGenres(accessToken, ArtistID);
    } else {
      console.error("Error fetching track audio features:", error);
      throw error;
    }
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
        // redirect_uri: `http://localhost:3001/callback`, // Backend callback URI
        redirect_uri: `https://spotify-util.onrender.com/callback`, // Backend callback URI for render
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

// Fetch all tracks from a playlist, handling pagination if necessary
const fetchTracks = async (playlistID, token) => {
  const tracks = [];
  let url = `https://api.spotify.com/v1/playlists/${playlistID}/tracks?limit=100`;

  while (url) {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = response.data;
    tracks.push(...data.items.map((song) => song.track));

    url = data.next; // Update URL to fetch the next page of results
  }

  return tracks;
};

// Fetch all Liked Songs from a user, continuing to call nextURL until all songs are saved
const fetchLikedSongs = async (accessToken) => {
  let likedSongs = [];
  let nextUrl = "https://api.spotify.com/v1/me/tracks?limit=50"; // Initial URL to fetch the first batch

  try {
    while (nextUrl) {
      const response = await axios.get(nextUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Process the current batch of songs
      likedSongs.push(
        ...response.data.items.map((item) => ({
          name: item.track.name,
          artists: item.track.artists,
          album: item.track.album.name,
          release_date: item.track.album.release_date,
          id: item.track.id,
          popularity: item.track.popularity,
        }))
      );

      // Update nextUrl to the URL for the next page of results
      nextUrl = response.data.next;
    }

    return likedSongs;
  } catch (error) {
    console.error("Error fetching liked songs:", error);
    return null;
  }
};

//sends POST request to spotify API to create a new playlist using the input parameters
const createPlaylist = async (
  userId,
  accessToken,
  playlistName,
  playlistDescription = "",
  isPublic
) => {
  try {
    const response = await axios.post(
      `https://api.spotify.com/v1/users/${userId}/playlists`,
      {
        name: playlistName,
        description: playlistDescription,
        public: isPublic, // Set to `true` if you want the playlist to be public
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error creating playlist:",
      error.response ? error.response.data : error.message
    );
    throw new Error("Failed to create playlist");
  }
};

//sends POST request to spotify API to add tracks (trackIds) into the selected playlist (playlistId)
const addTracksToPlaylist = async (playlistId, token, trackIds) => {
  try {
    const response = await axios.post(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        uris: trackIds.map((id) => `spotify:track:${id}`),
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error(
      "Error adding tracks to playlist:",
      error.response ? error.response.data : error.message
    );
    throw new Error("Failed to add tracks to playlist");
  }
};

module.exports = {
  fetchAudioFeatures,
  fetchGenres,
  fetchPlaylists,
  fetchSpotifyProfile,
  fetchToken,
  fetchLikedSongs,
  fetchTracks,
  createPlaylist,
  addTracksToPlaylist,
};

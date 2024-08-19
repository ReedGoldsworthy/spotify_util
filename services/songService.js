const Song = require("../models/song");
const axios = require("axios");
const {
  fetchAudioFeatures,
  fetchGenres,
  fetchTracks,
  fetchLikedSongs,
} = require("./spotifyService");

// gets tracks of a playlist from playlistID and stores tracks into DB. Function uses fetchGenres & fetchAudioFeatures to get details about track
const saveTracks = async (playlistID, token) => {
  try {
    let tracks = [];
    if (playlistID === "LikedSongs") {
      tracks = await fetchLikedSongs(token);
    } else {
      tracks = await fetchTracks(playlistID, token); // Fetch all tracks with pagination
    }

    const savedSongIDs = [];

    for (let index = 0; index < tracks.length; index++) {
      const track = tracks[index];

      if (!track || !track.id) {
        console.warn(
          `Track at index ${index} is invalid or has a null/undefined spotifyID. Skipping.`
        );
        continue;
      }

      const audioFeatures = await fetchAudioFeatures(token, track.id);
      const { genres, artistImage } = await fetchGenres(
        token,
        track.artists[0].id
      );

      let song = await Song.findOne({ spotifyID: track.id });

      if (!song) {
        const songObject = new Song({
          name: track.name,
          artist: track.artists[0].name,
          album: track.album.name,
          release_date: track.album.release_date,
          genres: genres,
          spotifyID: track.id,
          popularity: track.popularity,
          acousticness: audioFeatures.acousticness,
          danceability: audioFeatures.danceability,
          duration: audioFeatures.duration_ms,
          energy: audioFeatures.energy,
          instrumentalness: audioFeatures.instrumentalness,
          valence: audioFeatures.valence,
          artist_image: artistImage,
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

module.exports = {
  saveTracks,
};

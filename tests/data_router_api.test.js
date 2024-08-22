const { test, after, beforeEach, describe } = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);

const helper = require("./test_helper");

const User = require("../models/user");
const playlist = require("../models/playlist");
const Song = require("../models/song");

describe("DataRouter : getting playlists", () => {
  test("playlist are returned as json", async () => {
    await api
      .get("/api/data/playlist")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("all playlists are returned", async () => {
    const response = await api.get("/api/data/playlist");

    assert.strictEqual(response.body.length, helper.initialPlaylists.length);
  });

  test("a specific playlist is within the returned playlist", async () => {
    const response = await api.get("/api/data/playlist");

    const descriptions = response.body.map((e) => e.description);
    assert(descriptions.includes("Classical chess playlist"));
  });
});

describe("DataRouter : getting tracks", async () => {
  test("playlist tracks are returned as json", async () => {
    await api
      .get("/api/data/Timmytester/playlist/TesterID1234/tracks")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("all tracks are returned", async () => {
    const response = await api.get(
      "/api/data/Timmytester/playlist/TesterID1234/tracks"
    );

    assert.strictEqual(response.body.length, helper.initialSongs.length);
  });

  test("using an invalid playlist returns 404", async () => {
    await api
      .get("/api/data/Timmytester/playlist/fakePlaylist/tracks")
      .expect(404);
  });

  test("using an invalid user returns 404", async () => {
    await api
      .get("/api/data/fakeUser/playlist/RealRap124553/tracks")
      .expect(404);
  });
});

describe("DataRouter : getting aggregated data of playlist & tracks ", () => {
  test("playlist info is returned as json", async () => {
    await api
      .get("/api/data/Timmytester/playlist/TesterID1234/info")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("returned playlist info is correct", async () => {
    const response = await api.get(
      "/api/data/Timmytester/playlist/TesterID1234/info"
    );

    // Check the number of artists
    const expectedArtists = [
      {
        count: 1,
        artist: "The Weeknd",
        artist_image:
          "https://i.scdn.co/image/ab6761610000e5eb4293385d324db8558179afd9",
      },
      {
        count: 1,
        artist: "Ed Sheeran",
        artist_image:
          "https://i.scdn.co/image/ab6761610000e5eb4293385d324db8558179afd9",
      },
    ];
    assert.strictEqual(response.body.numArtists, expectedArtists.length);

    // Check if years are correct
    const expectedYears = [
      {
        count: 1,
        releaseYear: "2017",
      },
      {
        count: 1,
        releaseYear: "2019",
      },
    ];
    assert.deepStrictEqual(response.body.years, expectedYears);

    // Function to sort and format arrays for comparison
    const formatArray = (arr) =>
      arr
        .map((item) => ({
          artist: item.artist,
          count: item.count,
          artist_image: item.artist_image,
        }))
        .sort((a, b) => a.artist.localeCompare(b.artist));

    // Format and sort both arrays
    const sortedExpectedArtists = formatArray(expectedArtists);
    const sortedActualArtists = formatArray(response.body.artists);

    // Check if artists are correct
    assert.deepStrictEqual(sortedActualArtists, sortedExpectedArtists);

    // Check if genres are correct
    const expectedGenres = [
      { _id: "pop", count: 2 },
      { _id: "dancehall", count: 1 },
      { _id: "synthpop", count: 1 },
    ];

    const sortById = (arr) =>
      arr
        .map((item) => ({
          _id: item._id,
          count: item.count,
        }))
        .sort((a, b) => a._id.localeCompare(b._id));

    const sortedExpectedGenres = sortById(expectedGenres);
    const sortedActualGenres = sortById(response.body.allGenres);

    // Compare the sorted arrays
    assert.deepStrictEqual(sortedActualGenres, sortedExpectedGenres);

    const expectedAverages = {
      danceability: (0.8 + 0.8) / 2,
      acousticness: (0.4 + 0.1) / 2,
      energy: (0.7 + 0.7) / 2,
      instrumentalness: 0,
      valence: (0.9 + 0.7) / 2,
      popularity: (85 + 92) / 2,
    };

    assert.strictEqual(
      response.body.averages.averageDanceability.toFixed(2),
      expectedAverages.danceability.toFixed(2)
    );
    assert.strictEqual(
      response.body.averages.averageAcousticness.toFixed(2),
      expectedAverages.acousticness.toFixed(2)
    );
    assert.strictEqual(
      response.body.averages.averageEnergy.toFixed(2),
      expectedAverages.energy.toFixed(2)
    );
    assert.strictEqual(
      response.body.averages.averageInstrumentalness.toFixed(2),
      expectedAverages.instrumentalness.toFixed(2)
    );
    assert.strictEqual(
      response.body.averages.averageValence.toFixed(2),
      expectedAverages.valence.toFixed(2)
    );
    assert.strictEqual(
      response.body.averages.averagePopularity.toFixed(2),
      expectedAverages.popularity.toFixed(2)
    );

    // Check if parent genres (e.g., pop) are correct
    const expectedParentGenres = ["pop"];
    assert.deepStrictEqual(response.body.parentGenres, expectedParentGenres);
  });
});

after(async () => {
  await mongoose.connection.close();
});

// Sets the test DB to have one user and two playlists on start of each test
beforeEach(async () => {
  await User.deleteMany({});
  await playlist.deleteMany({});
  await Song.deleteMany({});

  //saving first user
  let userObject = new User(helper.initialUsers[0]);
  await userObject.save();

  //saving first playlist
  let playlistObject = new playlist(helper.initialPlaylists[0]);
  let savedSongIDs = [];

  // save all initial songs to first playlist
  for (const songData of helper.initialSongs) {
    let songObject = new Song(songData);
    const savedSong = await songObject.save();
    savedSongIDs.push(savedSong._id);
  }

  playlistObject.userId = userObject._id;
  playlistObject.tracks = savedSongIDs;

  await playlistObject.save();

  //saving second playlist
  playlistObject = new playlist(helper.initialPlaylists[1]);
  playlistObject.userId = userObject._id;
  await playlistObject.save();
});

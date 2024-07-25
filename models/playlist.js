const mongoose = require("mongoose");

const playlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  spotifyId: { type: String },
  name: { type: String },
  description: { type: String },
  tracks: [{ trackId: { type: mongoose.Schema.Types.ObjectId, ref: "Song" } }],
  createdAt: { type: Date, default: Date.now, expires: 3600 }, // TTL index: 3600 seconds = 1 hour
});

playlistSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Playlist", playlistSchema);

const mongoose = require("mongoose");

const songSchema = new mongoose.Schema({
  spotifyId: { type: String, unique: true },
  name: { type: String },
  artist: { type: String },
  album: { type: String },
  genre: { type: String },
  releaseYear: { type: Number },
  createdAt: { type: Date, default: Date.now, expires: 3600 }, // TTL index: 3600 seconds = 1 hour
});

songSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Song", songSchema);

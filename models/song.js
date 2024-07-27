const mongoose = require("mongoose");

const songSchema = new mongoose.Schema({
  // id: { type: Number },
  name: { type: String },
  artist: { type: String },
  album: { type: String },
  genre: { type: String },
  release_date: { type: String },
  spotifyID: { type: String, required: true, unique: true },
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

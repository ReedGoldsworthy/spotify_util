const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  spotifyId: { type: String, required: true, unique: true },
  displayName: { type: String },
  email: { type: String },
  image: { type: String },
  accessToken: { type: String },
  //   refreshToken: { type: String, required: true },
  //   tokenExpires: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now, expires: 3600 }, // TTL index: 3600 seconds = 1 hour
});

userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("User", userSchema);

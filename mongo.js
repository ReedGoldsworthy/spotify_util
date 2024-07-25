const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("give password as argument");
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://reedgoldsworthy2:${password}@cluster0.mcg3yyi.mongodb.net/noteApp?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.set("strictQuery", false);

mongoose.connect(url);

const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
});

const Note = mongoose.model("Note", noteSchema);

// const userSchema = new mongoose.Schema({
//   username: String,
// });

// const User = mongoose.model("User", userSchema);

// const user = new User({
//   username: "ReederPeeder420",
// });

// user.save().then((result) => {
//   console.log("user saved!");
//   mongoose.connection.close();
// });

// const note = new Note({
//   content: "mongo is important",
//   important: true,
// });

// note.save().then((result) => {
//   console.log("note saved!");
//   mongoose.connection.close();
// });

Note.find({}).then((result) => {
  result.forEach((note) => {
    console.log(note);
  });
  mongoose.connection.close();
});

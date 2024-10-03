require("dotenv").config(); // Load environment variables

var express = require("express");
var path = require("path");
var logger = require("morgan");
const session = require("client-sessions");
var cors = require("cors");

var app = express();
app.use(logger("dev"));
app.use(express.json());

app.use(
  session({
    cookieName: "session", // the cookie key name
    secret: process.env.COOKIE_SECRET || "template", // encryption key from env or fallback to template
    duration: 24 * 60 * 60 * 1000, // session duration
    activeDuration: 1000 * 60 * 5, // active session duration
    cookie: { httpOnly: false },
  })
);

// CORS configuration
const corsConfig = {
  origin: process.env.NODE_ENV === 'production' ? process.env.BASE_API_URL : process.env.BASE_API_URL_LOCAL, // Use the appropriate origin based on environment
  credentials: true,
};

app.use(cors(corsConfig));
app.options("*", cors(corsConfig));

// Static files setup for production
app.use(
  express.static(
    path.join(__dirname, "../assignment2-1-316120096_209512722/dist")
  )
);

app.get("/", function (req, res) {
  res.sendFile(
    path.join(__dirname, "../assignment2-1-316120096_209512722/dist/index.html")
  );
});

// Routes setup
const user = require("./routes/user");
const recipes = require("./routes/recipes");
const auth = require("./routes/auth");

app.get("/alive", (req, res) => res.send("I'm alive"));

app.use("/users", user);
app.use("/recipes", recipes);
app.use("/auth", auth);

// Error handling middleware
app.use(function (err, req, res, next) {
  console.log(err);
  let status = 500;
  if (err && err.status) {
    status = err.status;
  } else if (err && err.response && err.response.status) {
    status = err.response.status;
  }
  res.status(status).send({ message: err.message, success: false });
});

var port = process.env.PORT || "80"; // Use port from environment or fallback to 80 for production
const server = app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

process.on("SIGINT", function () {
  if (server) {
    server.close(() => console.log("server closed"));
  }
  process.exit();
});

module.exports = app;

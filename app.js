var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const session = require("express-session");
const cookieSession = require("cookie-session");
const passport = require("passport");
const { setLocals, checkAuth } = require("./common/functions");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

/* ========= Handlebar setup ============ */
const exphbs = require("express-handlebars");
const hbs = exphbs.create({
  extname: ".hbs",
  defaultLayout: "main",
  layoutsDir: path.join(__dirname, "views/layouts"),
  partialsDir: path.join(__dirname, "views/partials"),
  // listing helpers
  helpers: {
    // for section
    section: function (name, options) {
      if (!this._sections) this._sections = {};
      this._sections[name] = options.fn(this);
      return null;
    },
  },
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");

/* ========= Cookie Session ========== */
app.use(cookieSession({
  secret:"session",
  key:"werfasklcasghflkwefu"
}));

/* ========= Session ========== */
app.use(session({
  secret:"werfasklcasghflkwefu",
  saveUninitialized: true,
    resave: true,
    maxAge: Date.now() + 30 * 86400 * 1000,
    cookie: { secure: true },
}))

/* ======== passport initialization ========= */
app.use(passport.initialize());
app.use(passport.session());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

/* ========= DB connection ========== */
require("./db_connection")(process.env.DB_URL);

// set user in locals
app.use(setLocals);

// main route 
app.use("/", indexRouter);

// set authentication middleware
app.use(checkAuth)

app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});



// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;

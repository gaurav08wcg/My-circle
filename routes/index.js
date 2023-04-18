var express = require('express');
var router = express.Router(); 
const md5= require("md5")
const { usersModel } = require("../model/users");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

/* ====== Local strategy define ====== */
passport.use( new LocalStrategy(
  {
    usernameField: "email",
    passwordField:"password",
    passReqToCallback: true
  },
  async function(req, email, password, done){
    console.log("----------- find user ---------");
    usersModel.findOne(
      {
        email: {
          $regex: "^" + email + "$",
          $options: "i",
        },
        password: md5(password),
      },
      {
        firstName: 1,
        lastName: 1,
        gender: 1,
        email: 1,
      }
    )
    .then( ( user ) => {
      console.log("-------- inside .then() ---------")
      console.log("user =>", user);
      // user not found
      if (!user) {
        console.log("-------- user not found ---------");
        return done(null, false, {
          message: "Please enter valid login details",
        });  
      } 
      // user found
      else {
        console.log ("======================/* user successfully founded */======================");
        console.log("user =>", user);
        return done(null, user);
      }
    })
    // handle catch
    .catch(function (err) {
      console.log("err =>", err);
      return done(null, false, {
        message: "Please enter valid login details",
      });
    });
  }
));

  /* =========== serialize user ===========*/
  passport.serializeUser(function (user, done) {
    console.log("--------------serializeUser-------------");
    // console.log("user =>", user)
    done(null, user);
  });
  
  /* =========== deserialize user ===========*/
  passport.deserializeUser(function (user, done) {
    try {
      console.log("--------------deserializeUser--------------");
      const userDetail = user;
      // console.log("user =>", user)
      done(null, userDetail);
    } catch (error) {
      console.log(error);
    }
  });

/* GET home page ( Landing page ). */
router.get('/', function(req, res, next) {
  try {
    res.render('index', { title: 'Home' });
  } catch (error) {
    console.log("error => ",error);
    res.render("error", { message : "error" })
  }
});

/* Signup */
router.get("/signup", (req,res,next) => {
  try {
    res.render("signup/index", {layout:"auth", title: "sign up"})
  } catch (error) {
    console.log("error =>", error);
    res.render("error", { message: error })
  }
})

router.post("/signup", async (req,res,next) => {
  try {
    const bodyData = req.body;
    bodyData["password"] = md5(req.body.password); 
    await usersModel.create(bodyData);
    res.redirect("/signin");
  } catch {
    res.redirect("/signin")
  }
})

/* Sign in */
router.get("/signin", (req,res,next) => {
  try {
    res.render("signin/index", { layout:"auth", title:"sign in" })
  } catch (error) { 
    console.log("error =>", error);
    res.render("error", { message: error })
  }
})

router.post("/signin", async (req, res, next) => {
  try {
    passport.authenticate("local", function (err, user, info) {
      console.log("--------- inside authenticate ----------");

      // error
      if (err) {
        console.log("err =>", err);
        return next(err);
      }
      // user not found
      if (!user) {
        console.log("-------- user not found ---------");
        return res.redirect("/signin");
      }
      // user found successfully
      req.logIn(user, function (err) {
        if (err) return next(err);

        console.log("-----login success------");
        
        // store user details in locals
       
        console.log("locals =>", res.locals.user);
        res.redirect("/");
        console.log("user => ", req.user);
      });
    })(req, res, next);
  } catch (error) {
    res.redirect("/signin");
  }
});

/* Logout Post */
router.get("/logout/", async (req,res,next) => {
  try {
    console.log("logout");
    await req.logout();
    return res.redirect('/signin');
  } catch (error) {
    console.log("error =>", error);
    res.redirect("/signin");
  }
})

module.exports = router;

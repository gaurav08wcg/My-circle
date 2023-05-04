const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { usersModel } = require("./model/users");
const md5 = require("md5");

module.exports = {
  /* Local strategy define */
  localStrategyInitialization: async () => {
    return passport.use(
      new LocalStrategy(
        {
          usernameField: "email",
          passwordField: "password",
          passReqToCallback: true,
        },
        async function (req, email, password, done) {
          console.log("----------- find user ---------");
          usersModel
            .findOne({
              email: {
                $regex: "^" + email + "$",
                $options: "i",
              },
              password: md5(password),
            })
            .then((user) => {
              console.log("-------- inside .then() ---------");
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
                console.log(
                  "======================/* user successfully founded */======================"
                );
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
      )
    );
  },

  /* serialize user */
  serializeUser: async () => {
    return passport.serializeUser(function (user, done) {
      console.log("--------------serializeUser-------------");
      // console.log("user =>", user)
      done(null, user);
    });
  },

  /* deserialize user */
  deserializeUser: async () => {
    return passport.deserializeUser(function (user, done) {
      try {
        console.log("--------------deserializeUser--------------");
        const userDetail = user;
        // console.log("user =>", user)
        done(null, userDetail);
      } catch (error) {
        console.log(error);
      }
    });
  },
};

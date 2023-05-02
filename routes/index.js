var express = require("express");
var router = express.Router();
const md5 = require("md5");
const { usersModel } = require("../model/users");
const { postModel } = require("../model/post");
const passport = require("passport");
const { savedPostModel } = require("../model/saved-post");
// const LocalStrategy = require("passport-local").Strategy;
const ObjectId = require("mongoose").Types.ObjectId;
const auth = require("../auth");

/* --------- passport authentication configuration ----------  */
auth.localStrategyInitialization();
auth.serializeUser();
auth.deserializeUser();

/* ====== Local strategy define ====== */
// passport.use(
//   new LocalStrategy(
//     {
//       usernameField: "email",
//       passwordField: "password",
//       passReqToCallback: true,
//     },
//     async function (req, email, password, done) {
//       console.log("----------- find user ---------");
//       usersModel
//         .findOne({
//           email: {
//             $regex: "^" + email + "$",
//             $options: "i",
//           },
//           password: md5(password),
//         })
//         .then((user) => {
//           console.log("-------- inside .then() ---------");
//           console.log("user =>", user);
//           // user not found
//           if (!user) {
//             console.log("-------- user not found ---------");
//             return done(null, false, {
//               message: "Please enter valid login details",
//             });
//           }
//           // user found
//           else {
//             console.log(
//               "======================/* user successfully founded */======================"
//             );
//             console.log("user =>", user);
//             return done(null, user);
//           }
//         })
//         // handle catch
//         .catch(function (err) {
//           console.log("err =>", err);
//           return done(null, false, {
//             message: "Please enter valid login details",
//           });
//         });
//     }
//   )
// );

/* =========== serialize user ===========*/
// passport.serializeUser(function (user, done) {
//   console.log("--------------serializeUser-------------");
//   // console.log("user =>", user)
//   done(null, user);
// });

/* =========== deserialize user ===========*/
// passport.deserializeUser(function (user, done) {
//   try {
//     console.log("--------------deserializeUser--------------");
//     const userDetail = user;
//     // console.log("user =>", user)
//     done(null, userDetail);
//   } catch (error) {
//     console.log(error);
//   }
// });

/* email validation */
router.get("/validate/email", async (req, res, next) => {
  try {
    console.log("req.query", req.query);
    const condition = { email: req.query.email }

    // when user edit their profile 
    if (req.query.userId) {
      condition["_id"] = { $ne: new ObjectId(req.user._id) }
    }

    const isEmail = await usersModel.findOne(condition, { email: 1 })

    // when email is exist 
    if (isEmail) return res.send(false);

    return res.send(true);

  } catch (error) {
    res.render("error", { message: error });
  }
});

/* GET home page ( Landing page ). */
router.get("/", async function (req, res, next) {
  try {
    // query data
    const filter = req.query.filter;
    const sortBy = req.query.sortBy;
    const order = Number(req.query.order);

    // pagination variables 
    const limit = 5;
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * limit;

    let search = req.query.search;
    // console.log("req.query.search =>",req.query.search);

    // if user click on archive
    if (req.query.archive) await postModel.updateOne({ _id: new ObjectId(req.query.postId) }, { isArchived: true })

    // for sorting key value
    let sortType = "createdAt";
    let sortOrder = -1;

    const match = {
      $match: {
        isArchived: false,
      },
    };


    // if user do filter post
    if (filter) {
      // match.$match["$or"] = [];
      // console.log("$or =>", match.$match);
      switch (filter) {
        // user select "mine post"
        case "mine":
          match.$match["postBy"] = new ObjectId(req.user._id)
          // match.$match?.$or?.push({ "postBy": new ObjectId(req.user._id) })
          console.log("filter-mine =>", match.$match.$or);
          break;


        // user select "mine post"
        case "other":
          match.$match["postBy"] = { $ne: new ObjectId(req.user._id) }
          // match.$match?.$or?.push({ "postBy": { $ne: new ObjectId(req.user._id) } })
          console.log("filter-other =>", match.$match.$or);
          break;

        default:
          break;
      }
    }

    // if search a post
    if (search) {
      match.$match["$or"] = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
      console.log("filter + search =>", match.$match.$or);
    }

    console.log("filter =>", filter);
    console.log("search =>", search);

    // if sort post
    if (sortBy) {
      // title
      if (sortBy == "title") {

        sortType = sortBy;
        sortOrder = order;

        // sortType = "title";
        // sortOrder = 1;
        console.log("pipeline sort =>", sortType, sortOrder);
      }

      // date time
      if (sortBy == "dateTime") {
        sortType = "createdAt";
        sortOrder = order;
      }
    }

    const pipeline = [];

    pipeline.push(match);
    pipeline.push({
      $lookup: {
        from: "users",
        localField: "postBy",
        foreignField: "_id",
        as: "post_with_users",
      },
    });

    // all post without skip limit 
    const allPostList = await postModel.aggregate(pipeline);
    
    // count of total post (without skip limit)
    const totalPost = allPostList.length

    pipeline.push({
      $project: {
        title: 1,
        description: 1,
        postBy: 1,
        postBy: { $first: "$post_with_users" },
        postImage: "$postImage.name",
        createdAt: 1,
      },
    });
    pipeline.push({
      $sort: {
        [sortType]: sortOrder
      }
    });

    pipeline.push(
      { $skip: skip },
      { $limit: limit }
    )

    const allPost = await postModel.aggregate(pipeline);
     // count of total post (without skip limit)
    // const totalPost = allPostList.length
    const savedPostData = await savedPostModel.find();
    // console.log("pipeline =>", pipeline);
    console.log("allPost =>", allPost);

    // total no of pages
    const pages = [];
    for (let i = 1; i <= Math.ceil(totalPost / limit); i++) {
      pages.push(i);
    }
    console.log("no of pages =>", pages);

    res.render("index", {
      title: "Home",
      posts: allPost,
      totalPosts: totalPost,
      pages: pages,
      totalPages: Math.ceil(totalPost / limit),
      currentPage: page,
      savedPostData:savedPostData,
      message : req.flash('message'),
      className: 'success'
    });
  } catch (error) {
    console.log("error => ", error);
    res.render("error", { message: error });
  }
});

/* Signup */
router.get("/signup", (req, res, next) => {
  try {
    res.render("signup/index", { layout: "auth", title: "sign up" });
  } catch (error) {
    console.log("error =>", error);
    res.render("error", { message: error });
  }
});

router.post("/signup", async (req, res, next) => {
  try {
    const bodyData = req.body;
    bodyData["password"] = md5(req.body.password);
    await usersModel.create(bodyData);
    req.flash('message', `Sign up successfully, ${bodyData.firstName}`);
    req.flash('className','success');
    res.redirect("/signin");
  } catch (error) {
    res.redirect("/signin");
  }
});

/* Sign in */
router.get("/signin", (req, res, next) => {
  try {
    res.render("signin/index", { layout: "auth", title: "sign in" ,className:req.flash('className'), message: req.flash('message') });
  } catch (error) {
    console.log("error =>", error);
    res.render("error", { message: error });
  }
});

router.post("/signin", async (req, res, next) => {
  try {
    passport.authenticate("local", function (err, user, info) {
      console.log("--------- inside authenticate ----------");

      // error
      if (err) {
        console.log("err =>", err);
        req.flash('message', `${err}`);
        return next(err);
      }
      // user not found
      if (!user) {
        console.log("-------- user not found ---------");
        req.flash('message', 'Please enter valid Credentials');
        return res.redirect("/signin");
      }
      // user found successfully
      req.logIn(user, function (err) {
        if (err) return next(err);

        console.log("-----login success------");
        req.flash('message', 'Login Successfully...');
        
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
router.get("/logout/", async (req, res, next) => {
  try {
    console.log("logout");
    await req.logout();
    return res.redirect("/");
  } catch (error) {
    console.log("error =>", error);
    res.redirect("/signin");
  }
});

module.exports = router;

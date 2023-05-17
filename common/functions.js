const serverSocket = require("../server-socket");
module.exports = {
  setLocals: function (req, res, next) {
    if (req.user) {
      res.locals.user = req.user;
      // create new room name of userId and store their sockets
      serverSocket.createRoom();
    }
    next();
  },
  checkAuth: function (req, res, next) {
    try {
      const reqUrl = req.url.split("/")?.[req.url.split("/").length - 1];
      // console.log("reqUrl =>", reqUrl);

      // when user click on email-verification link can't check authentication
      const isNotEmailVerifyRoute = reqUrl != "email-verification";

      if (!req.user && isNotEmailVerifyRoute) {
        console.log("------- User not authenticate--------");
        return res.redirect("/signin");
      }
      console.log("-------- User authenticate ----------");
      // console.log("auth user =>", req.user);
      return next();
    } catch (error) {
      console.log("error =>", error);
      res.redirect("/login");
    }
  },
  addHours: function (date, hours) {
    date.setHours(date.getHours() + hours);
    return date;
  },
  addMinutes: function (date, minutes) {
    date.setMinutes(date.getMinutes() + minutes);
    return date;
  },
  removeMinutes: function (date, minutes) {
    date.setMinutes(date.getMinutes() - minutes);
    return date;
  },
};


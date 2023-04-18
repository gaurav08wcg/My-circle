module.exports = {
    setLocals: function (req, res, next) {
        if (req.user) {
            res.locals.user = req.user;
        }
        next();
    },
    checkAuth: function (req, res, next) {
        try {
            if (!req.user) {
                console.log("------- User not authenticate--------");
                return res.redirect("/signin")
            }
            console.log("-------- User authenticate ----------");
            console.log("auth user =>", req.user);
            return next();
        } catch (error) {
            console.log("error =>", error);
            res.redirect("/login");
        }
    }
};


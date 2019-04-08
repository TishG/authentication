const express               = require("express");
      app                   = express();
      port                  = process.env.PORT || 3000;
      dotenv                = require("dotenv").config();
      passport              = require("passport");
      LocalStrategy         = require("passport-local");
      passportLocalMongoose = require("passport-local-mongoose");
      bodyParser            = require("body-parser");
      mongoose              = require("mongoose");
      User                  = require("./models/User");
      URI                   = `mongodb+srv://dbUser:${process.env.dbPassword}@associations-uxuuu.mongodb.net/passportLocal?retryWrites=true`;
      mongoose.connect(URI, {useNewUrlParser: true}, (err) => {
          if(err) console.log(err);
          else console.log("...connected to the db...");
      });

      app.set("view engine", "ejs");
      app.use(bodyParser.urlencoded({extended: true}));
      app.use(require("express-session")({
          secret: process.env.cookieSecret,
          resave: false,
          saveUninitialized: false
      }));
      app.use(passport.initialize());
      app.use(passport.session());
      passport.use(new LocalStrategy(User.authenticate()));
      passport.serializeUser(User.serializeUser());
      passport.deserializeUser(User.deserializeUser());

      app.get("/", (req, res, next) => {
          res.render("home");
      });

      app.get("/secret", isLoggedIn, (req, res, next) => {
          res.render("secret");
      });

      //register routes
      app.get("/register", (req, res, next) => {
          res.render("register");
      });

      app.post("/register", (req, res, next) => {
        let username = req.body.username;
        let password = req.body.password;
        User.register(new User({username: username}), password, (err, user) => {
            if(err) {
                console.log(err);
                return res.render("register");
            } else {
                passport.authenticate("local")(req, res, next => {
                    res.redirect("/secret");
                })
            }
        })
      });

      //Login routes
      app.get("/login", (req, res, next) => {
          res.render("login");
      });

      app.post("/login",
      passport.authenticate('local', { 
          successRedirect: '/secret',
          failureRedirect: '/login' 
        }), err => {
            if(err) console.log(err);
            else console.log("Successfully logged in user!");
        })

        //Logout route
        app.post("/logout", (req, res, next) => {
            req.logout();
            res.redirect("/");
            console.log("Successfully logged out");
        })

        function isLoggedIn(req, res, next) {
            if(req.isAuthenticated()) {
                return next();
            }
            res.redirect("/");
        }

      app.listen(port, (err) => {
        if(err) console.log(err);
        else console.log(`...listening on port ${port}...`);
    });
var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/users");
var campground = require("../models/campground");
//root route
router.get("/", function(req, res){
    res.render("landing");
});


// show register form
router.get("/register", function(req, res){
   res.render("register",{page: 'register'}); 
});

//
router.post("/register", function(req, res){
      var newUser = new User({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        avatar: req.body.avatar
      });
    User.register(newUser, req.body.password, function(err, user){
        if(err){
			req.flash("error", err.message);
            console.log(err);
            return res.render("register", {error: err.message});
        }
        passport.authenticate("local")(req, res, function(){
			req.flash("success", "Welcome to Camp " + user.username);
           res.redirect("/campgrounds"); 
        });
    });
});

// USER PROFILE
router.get("/users/:id", function(req, res) {
  User.findById(req.params.id, function(err, foundUser) {
    if(err) {
      req.flash("error", "Something went wrong.");
      res.redirect("/");
    }
    campground.find().where('author.id').equals(foundUser._id).exec(function(err, campgrounds) {
      if(err) {
        req.flash("error", "Something went wrong.");
        res.redirect("/");
      }
      res.render("users/show", {user: foundUser, campgrounds: campgrounds});
    });
  });
});

//login
router.get("/login", function(req, res){
   res.render("login",{page: 'login'}); 
});

// handling login logic
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login"
    }), function(req, res){
});


// logic route
router.get("/logout", function(req, res){
   req.logout();
	req.flash("success", "Logged you out!See you again");
   res.redirect("/campgrounds");
});



module.exports = router;
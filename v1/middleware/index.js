var campground = require("../models/campground");
var comment = require("../models/comment");

// all the middleare goes here
var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req, res, next) {
 if(req.isAuthenticated()){
        campground.findById(req.params.id, function(err, foundCampground){
            if(err || !foundCampground){
          console.log(err);
          req.flash('error', 'Sorry, that campground does not exist!');
          res.redirect('/campgrounds');
           }  else {
               // does user own the campground?
            if(foundCampground.author.id.equals(req.user._id)) {
				 req.campground = foundCampground;
                next();
            } else {
				req.flash("error", "You don't have permission to do that");
                res.redirect('/campgrounds/' + req.params.id);
            }
           }
        });
    } else {
		req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

middlewareObj.checkCommentOwnership = function(req, res, next) {
 if(req.isAuthenticated()){
        comment.findById(req.params.comment_id, function(err, foundComment){
           if(err || !foundComment){
           console.log(err);
           req.flash('error', 'Sorry, that comment does not exist!');
           res.redirect('/campgrounds');
           }  else {
               // does user own the comment?
            if(foundComment.author.id.equals(req.user._id)) {
                next();
            } else {
				req.flash("error", "You don't have permission to do that");
				req.comment = foundComment;
                res.redirect('/campgrounds/' + req.params.id);
            }
           }
        });
    } else {
		 req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
	req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");
};

module.exports = middlewareObj;
var express = require("express");
var router  = express.Router();
var campground = require("../models/campground");
var middleware = require("../middleware");
var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);


//INDEX - show all campgrounds
router.get("/", function(req, res){
	var noMatch = null;
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
       
        campground.find({name: regex}, function(err, allCampgrounds){
           if(err){
               console.log(err);
           } else {
              if(allCampgrounds.length < 1) {
                  noMatch = "No campgrounds match that query, please try again.";
              }
              res.render("campgrounds/index",{campgrounds:allCampgrounds, noMatch: noMatch});
           }
        });
    } else {
		campground.find({},function(err,campgrounds){
			if(err)
			{
				console.log("Error"+err);
			}
			else
			{
				console.log(campgrounds);
				res.render("campgrounds/index",{campgrounds:campgrounds,page: 'campgrounds', noMatch: noMatch});
			}
	});
	} 
});
//CREATE - add new campground to DB
router.post("/",middleware.isLoggedIn,function(req,res){
	var name =req.body.name;
	var price = req.body.price; 
	var image=req.body.image;
	var desc = req.body.description;
	var author = {
        id: req.user._id,
        username: req.user.username
    };
	 geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
		console.log(err);
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
		 
	var newCampground = {name: name,price: price, image: image, description: desc,author:author,location:location,lat: lat, lng: lng};
	campground.create(newCampground,function(err,campground)
					{
		if(err)
			{
				console.log("Error"+err);
			}
		else
			{
				res.redirect("/campgrounds");
			}
		
		});
	});
});

//NEW - show form to create new campground
router.get("/new",middleware.isLoggedIn,function(req,res){
	res.render("campgrounds/new");
});

// SHOW - shows more info about one campground
router.get("/:id",function(req,res){
	  campground.findById(req.params.id).populate("comments likes").exec(function(err, foundCampground){
        if(err || !foundCampground){
            console.log(err);
            req.flash("error", "Sorry, that campground does not exist!");
           res.redirect('/campgrounds');
        } else {
            //render show template with that campground
			console.log(foundCampground);
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});


// EDIT CAMPGROUND ROUTE
router.get("/:id/edit",middleware.checkCampgroundOwnership, function(req, res){
    campground.findById(req.params.id, function(err, foundCampground){
        res.render("campgrounds/edit", {campground: foundCampground});
    });
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id",middleware.checkCampgroundOwnership, function(req, res){
	geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    req.body.campground.lat = data[0].latitude;
    req.body.campground.lng = data[0].longitude;
    req.body.campground.location = data[0].formattedAddress;
    // find and update the correct campground
    campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
       if(err){
           res.redirect("/campgrounds");
       } else {
           //redirect somewhere(show page)
           res.redirect("/campgrounds/" + req.params.id);
       }
    	});
 	});
});

//Delete
router.delete("/:id",middleware.checkCampgroundOwnership, function(req, res){
   campground.findByIdAndRemove(req.params.id, function(err){
      if(err){
          res.redirect("/campgrounds");
      } else {
          res.redirect("/campgrounds");
      }
   });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}


// Campground Like Route
router.post("/:id/like", middleware.isLoggedIn, function (req, res) {
    campground.findById(req.params.id, function (err, foundCampground) {
        if (err) {
            console.log(err);
            return res.redirect("/campgrounds");
        }

        // check if req.user._id exists in foundCampground.likes
        var foundUserLike = foundCampground.likes.some(function (like) {
            return like.equals(req.user._id);
        });

        if (foundUserLike) {
            // user already liked, removing like
            foundCampground.likes.pull(req.user._id);
        } else {
            // adding the new user like
            foundCampground.likes.push(req.user);
        }

        foundCampground.save(function (err) {
            if (err) {
                console.log(err);
                return res.redirect("/campgrounds");
            }
            return res.redirect("/campgrounds/" + foundCampground._id);
        });
    });
});

module.exports = router;

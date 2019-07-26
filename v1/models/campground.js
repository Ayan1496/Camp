
var mongoose=require("mongoose");
//Schema
var campgroundschema=new mongoose.Schema({
	name:String,
	image:String,
	price: String,
	description:String,
	createdAt:{type:Date,default:Date.now},
	location:String,
	lat:Number,
	lng:Number,
	author: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String
   },
	comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ],
	 likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]
});
//model
module.exports=mongoose.model("campground",campgroundschema);
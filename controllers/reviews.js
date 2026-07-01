const Campground=require("../models/campground.js");
const Review=require("../models/review.js");

module.exports.postReview=async (req,res)=>{
    const {id}=req.params;
    const req_campground=await Campground.findById(id);
    const new_review=new Review(req.body.review);
    new_review.author=req.user._id;
    await new_review.save()

    await Campground.findByIdAndUpdate(id,{$push:{reviews:new_review._id}});
    req.flash("success","Thanks for Creating Review");
    res.redirect(`/campgrounds/${id}`);
}

module.exports.deleteReview=async (req,res)=>{
    const {id,review_id}=req.params;
    await Review.findByIdAndDelete(review_id);
    await Campground.findByIdAndUpdate(id,{$pull:{reviews:review_id}});
    req.flash("success","Successfully deleted Review");
    res.redirect(`/campgrounds/${id}`);
}

const ExpressErr=require("./Utility/ExpressErr");
const {campgroundSchema,reviewSchema}=require("./formSchema.js");
const Campground=require("./models/campground.js");
const Review=require("./models/review.js");

module.exports.isLoggedin=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash("error","You have to be signed in");
        return res.redirect("/login");
    }
    next();
}

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

module.exports.validateCampground=(req,res,next)=>{

    const {error}=campgroundSchema.validate(req.body);
    if(error){
        const msg=error.details.map(ele=>ele.message).join(',');
        throw new ExpressErr(msg,400);
    }
    else{
        next();
    }
}

module.exports.isCampAuthor=async (req,res,next)=>{
    const {id}=req.params;
    const req_info=await Campground.findById(id);
    if(!req_info){
        req.flash("error","Campground not found!!!!");
        return res.redirect(`/campgrounds`); 
    }
    if(!req_info.author.equals(req.user._id)){
        req.flash("error","You are not Allowed to edit it!!!");
        return res.redirect(`/campgrounds/${id}`); 
    }
    
    next();
}

module.exports.isReviewAuthor=async (req,res,next)=>{
    const {id,review_id}=req.params;
    const req_Review=await Review.findById(review_id);
    if(!req_Review){
        req.flash("error","Review not found!!!");
        return res.redirect(`/campgrounds/${id}`); 
    }
    if(!req_Review.author.equals(req.user._id)){
        req.flash("error","You are not Allowed to delete it!!!");
        return res.redirect(`/campgrounds/${id}`); 
    }
    next();
}

module.exports.validateReview=(req,res,next)=>{
    const {error}=reviewSchema.validate(req.body);
    if(error){
        const msg=error.details.map(ele=>ele.message).join(',');
        throw new ExpressErr(msg,400);
    }
    else{
        next();
    }
}
const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync=require("../Utility/CatchAsync");
const {validateReview,isLoggedin,isReviewAuthor}=require("../middlewares.js");
const reviewMethods=require("../controllers/reviews.js");

router.post("/",isLoggedin,validateReview,wrapAsync(reviewMethods.postReview));

router.delete("/:review_id",isLoggedin,isReviewAuthor,wrapAsync(reviewMethods.deleteReview));

module.exports=router;
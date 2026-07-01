const express=require("express");
const router=express.Router();
const wrapAsync=require("../Utility/CatchAsync");
const Campground=require("../models/campground.js");
const {isLoggedin,storeReturnTo,validateCampground,isCampAuthor}=require("../middlewares.js");
const camgroundMethods=require("../controllers/campgrounds.js");

const {storage}=require("../cloudinary/index.js")
const multer  = require('multer');
const upload = multer({ storage });

router.route("/")
    .get(wrapAsync(camgroundMethods.index))
    .post(isLoggedin,upload.array('image'),validateCampground,wrapAsync(camgroundMethods.postCamp))

router.get("/new",isLoggedin,camgroundMethods.newCampForm);
router.get("/:id/edit",isLoggedin,isCampAuthor,wrapAsync(camgroundMethods.getCampEditForm));

router.route("/:id")
   .put(isLoggedin,isCampAuthor,upload.array('image'),validateCampground,wrapAsync(camgroundMethods.postEditedInfo))
   .delete(isLoggedin,isCampAuthor,wrapAsync(camgroundMethods.deleteCamp))
   .get(wrapAsync(camgroundMethods.getCamp))


module.exports=router;
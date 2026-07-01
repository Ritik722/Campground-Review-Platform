const express=require("express")
const router=express.Router();
const passport = require("passport");
const {storeReturnTo}=require("../middlewares.js");
const userMethods=require("../controllers/users.js");

router.route("/register")
  .get(userMethods.getRegisterForm)
  .post(userMethods.registerUser)

router.route("/login")
  .get(userMethods.getLoginForm)
  .post(storeReturnTo,passport.authenticate('local',{failureFlash:true,failureRedirect:"/login"}),userMethods.loginUser)

router.get('/logout', userMethods.logoutUser); 

module.exports=router;
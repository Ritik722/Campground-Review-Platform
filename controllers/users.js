const User=require("../models/user.js");

module.exports.getRegisterForm=(req,res)=>{
    res.render("users/registerForm");
}

module.exports.registerUser=async (req,res)=>{
    try{
        const {password,username,email}=req.body;
        const new_user=new User({username,email});
        const registeredUser=await User.register(new_user,password);
        req.login(registeredUser,(err)=>{
            if(err) return next(err);
            req.flash("success","Welcome to the YelpCamp");
            res.redirect("/campgrounds");
        });
    }
    catch(e){
        req.flash("error",e.message);
        return res.redirect("/register");
    }
};

module.exports.getLoginForm=(req,res)=>{
    res.render("users/loginForm");
};

module.exports.loginUser=async (req,res)=>{
    req.flash("success","Welcome to the YelpCamp!!!!");
    const redirectUrl=res.locals.returnTo || "/campgrounds";
    res.redirect(redirectUrl);
}

module.exports.logoutUser=(req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}
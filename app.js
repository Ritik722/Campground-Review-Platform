if(process.env.NODE_ENV !== "production"){
    require("dotenv").config({quiet:true});
}

const express=require("express");
const app=express();
const mongoSanitize = require('express-mongo-sanitize');
app.use(mongoSanitize());

const path=require("path");
app.set("view engine",'ejs');
app.set("views",path.join(__dirname,"views"));

const dbUrl=process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp';
const mongoose=require("mongoose");
async function main(){
    try {
        await mongoose.connect(dbUrl);
        console.log("Mongoose Connection open!");

    } catch (err) {
        console.error("Connection failed:", err);
    }
}
main();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,"public")));

const methodOverride = require('method-override');
app.use(methodOverride('_method'));

const ejsMate=require("ejs-mate");
app.engine('ejs',ejsMate);

const ExpressErr=require("./Utility/ExpressErr");

const campgroundRoutes=require("./routes/campgrounds.js");
const reviewRoutes=require("./routes/reviews.js");
const userRoutes=require("./routes/users.js");

const session=require("express-session");
const { MongoStore } = require('connect-mongo');
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'thisshouldbeasecret'
    }
});

const sessionConfig={
    store,
    name:"session",
    secret:"thisshouldbeasecret",
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        expires:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
};
app.use(session(sessionConfig));

const flash=require("connect-flash");
app.use(flash());

const User=require("./models/user.js");
const passport=require("passport");
const localStrategy=require("passport-local");
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const helmet=require("helmet");
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", 
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", 
];
const connectSrcUrls = [
    "https://api.maptiler.com/",
    "https://cdn.maptiler.com/",
    "https://cdn.jsdelivr.net",      
];

const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dfioy3dhs/", 
                "https://images.unsplash.com/",
                "https://api.maptiler.com/",
                "https://cdn.maptiler.com/", // Add this here too!
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

// <------ Routes ------->

app.use((req,res,next)=>{
    res.locals.currentUser=req.user;
    res.locals.msg=req.flash("success");
    res.locals.error=req.flash("error");
    next();
});

app.use("/",userRoutes);
app.use("/campgrounds",campgroundRoutes);
app.use("/campgrounds/:id/reviews",reviewRoutes);

app.get("/",(req,res)=>{
    res.render("home");
});

app.all('/{*path}', (req, res, next) => {
    next(new ExpressErr("Page not Found!!!",404));
});

app.use((err,req,res,next)=>{
    const {statusCode=404}=err;
    if(!err.message){
        err.message="oh No!! Something Went Wrong"
    }
    res.status(statusCode).render("Error",{err});
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
});

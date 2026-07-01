const Campground=require("../models/campground.js");
const {cloudinary}=require("../cloudinary/index.js");

const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index=async (req,res)=>{
    const campgrounds=await Campground.find({});
    res.render("campgrounds/index",{campgrounds});
};

module.exports.newCampForm=(req,res)=>{
    res.render("campgrounds/form");
}

module.exports.postCamp=async (req,res)=>{
    const {campground}=req.body;
    const {state,city}=campground;
    campground.location=`${city}, ${state}`;
    delete campground.city;
    delete campground.state;

    const geoData = await maptilerClient.geocoding.forward(campground.location, { limit: 1 });
    // console.log(geoData);
    if (!geoData.features?.length) {
        req.flash('error', 'Could not geocode that location. Please try again and enter a valid location.');
        return res.redirect('/campgrounds/new');
    }

    campground.geometry = geoData.features[0].geometry;
    campground.location = geoData.features[0].place_name;
    campground.author=req.user._id;
    campground.images=req.files.map(f=>({url:f.url,filename:f.public_id}));
    
    const new_campground=new Campground(campground);
    await new_campground.save();
    
    req.flash("success","Successfully created campground!!!!");
    res.redirect(`/campgrounds/${new_campground._id}`);
    
};

module.exports.getCampEditForm=async (req,res)=>{
    const {id}=req.params;
    const req_info=await Campground.findById(id);
    if(!req_info){
        req.flash("error","Cannot Find the Campground!!!!");
        return res.redirect("/campgrounds");
    }
    
    const {location}=req_info;
    const [city,state]=location.split(", ");
    req_info.city=city;
    req_info.state=state;
    delete req_info.location

    res.render("campgrounds/edit",{req_info});
}

module.exports.postEditedInfo=async (req,res)=>{
    const {id}=req.params;
    const old_campground=await Campground.findById(id);
    if(!old_campground){
        req.flash("error","Cannot Find the Campground!!!!");
        return res.redirect("/campgrounds");
    }

    const {campground}=req.body;
    const {state,city}=campground;
    campground.location=`${city}, ${state}`;
    delete campground.city;
    delete campground.state;

    const geoData = await maptilerClient.geocoding.forward(campground.location, { limit: 1 });
    // console.log(geoData);
    if (!geoData.features?.length) {
        req.flash('error', 'Could not geocode that location. Please try again and enter a valid location.');
        return res.redirect(`/campgrounds/${id}/edit`);
    }
    campground.geometry = geoData.features[0].geometry;
    campground.location = geoData.features[0].place_name;
    campground.author=req.user._id;

    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        old_campground.images=old_campground.images.filter(img=>{
            const exitInDb=req.body.deleteImages.some(deleteFileName=>deleteFileName===img.filename);
            return !exitInDb;
        })
    }
    
    const imgs=req.files.map(f=>({url:f.url,filename:f.public_id}));
    campground.images=[...old_campground.images,...imgs];

    await Campground.replaceOne(
        {_id:id},
        campground
    );

    req.flash("success","successfully updated campground!!!");
    res.redirect(`/campgrounds/${id}`);
}

module.exports.deleteCamp=async (req,res)=>{
    const {id}=req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success","Successfully deleted Campground");
    res.redirect("/campgrounds");
}

module.exports.getCamp=async (req,res)=>{
    const {id}=req.params;
    const req_campground=await Campground.findById(id).populate({
        path:"reviews",
        populate:{
            path:"author"
        }
        }).populate("author");
    if(!req_campground){
        req.flash("error","Cannot Find the Campground!!!!");
        res.redirect("/campgrounds");
    }
    else{
        res.render("campgrounds/show",{req_campground});
    }
}
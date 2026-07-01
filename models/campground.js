const mongoose=require("mongoose");
const schema=mongoose.Schema;
const Review=require("./review.js");
const { ref } = require("joi");

const imageSchema=new schema({ 
    url:String,
    filename:String
})

imageSchema.virtual("thumbnail").get(function(){
    return this.url.replace("/upload","/upload/w_200");
})

const opts = { toJSON: { virtuals: true } };

const campGroundSchema=new schema({
    title:String,
    images:[imageSchema],
    price:Number,
    description:String,
    location:String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    author:{
        type:schema.Types.ObjectId,
        ref:"User"
    },
    reviews:[
        {
            type:schema.Types.ObjectId,
            ref:"Review"
       }
    ]
},opts);

campGroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0, 20)}...</p>`
});

campGroundSchema.post('findOneAndDelete',async function(campground){
    if(campground){
        await Review.deleteMany({_id:{$in:campground.reviews}});
    }
});

module.exports=mongoose.model("Campground",campGroundSchema);

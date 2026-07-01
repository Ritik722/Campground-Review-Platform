const mongoose = require("mongoose");
if(process.env.NODE_ENV !== "production"){
    require("dotenv").config({quiet:true});
}
const dbUrl=process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp';
async function main() {
  try {
    await mongoose.connect(dbUrl);
    console.log("Mongoose Connection open!");
  } catch (err) {
    console.error("Connection failed:", err);
  }
}
main();
const Campground = require("../models/campground.js");
const cities = require("./cities.js");
const { places, descriptors } = require("./seedHelpers.js");

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDb = async () => {
  await Campground.deleteMany({});

  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: "6a43446102a3bfc37d9cf8fb",
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ]
      },
      title: `${sample(descriptors)}, ${sample(places)}`,
      images: [
        {
          url: "http://res.cloudinary.com/dfioy3dhs/image/upload/v1782376973/YelpCamp/fqyhkm2igp8guobgck9a.jpg",
          filename: "YelpCamp/fqyhkm2igp8guobgck9a",
        },
      ],
      description:
        "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Molestiae, minima esse delectus hic in unde voluptatum rerum tempora harum maiores, quae nostrum error vel, consectetur neque deleniti magnam fugit dignissimos?",
      price: price,
    });
    await camp.save();
  }
};

seedDb().then(() => {
  mongoose.connection.close();
});
